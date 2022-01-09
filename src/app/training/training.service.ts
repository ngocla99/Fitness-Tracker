import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { UiService } from '../shared/ui.service';
import { Exercise } from './exercise.model';

@Injectable({
  providedIn: 'root',
})
export class TrainingService {
  exerciseChanged = new Subject<Exercise | null>();
  exercisesChanged = new Subject<Exercise[]>();
  finishedExercisesChanged = new Subject<Exercise[]>();
  private availableExercise: Exercise[] = [];
  private runningExercise!: Exercise | null;
  fbSubs$: Subscription[] = [];

  constructor(
    private db: AngularFirestore,
    private uiService: UiService,
    private snackBar: MatSnackBar
  ) {}
  fetchAvailableExercise() {
    this.uiService.isLoadingState.next(true);
    this.fbSubs$.push(
      this.db
        .collection('availableExercise')
        .snapshotChanges()
        .pipe(
          map((docArray) => {
            return docArray.map((doc) => {
              const data = doc.payload.doc.data() as Exercise;
              return {
                id: doc.payload.doc.id,
                name: data.name,
                duration: data.duration,
                calories: data.calories,
              };
            });
          })
        )
        .subscribe(
          (exercises: Exercise[]) => {
            this.uiService.isLoadingState.next(false);
            this.availableExercise = exercises;
            this.exercisesChanged.next([...this.availableExercise]);
          },
          () => {
            this.uiService.isLoadingState.next(false);
            this.exerciseChanged.next(null);
            this.uiService.showSnackbar(
              'Fetching Exercises failed, pleased try again later',
              '',
              3000
            );
          }
        )
    );
  }

  startExercise(selectedId: string) {
    this.db
      .doc('availableExercise/' + selectedId)
      .update({ lastSelected: new Date() });
    const exercise = this.availableExercise.find(
      (exercise) => exercise.id === selectedId
    );
    if (exercise) {
      this.runningExercise = exercise;
      this.exerciseChanged.next({ ...this.runningExercise });
    }
  }

  completeExercise() {
    if (this.runningExercise) {
      this.addDataToDatabase({
        ...this.runningExercise,
        date: new Date(),
        state: 'complete',
      });
    }
    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  cancelExercise(progress: number) {
    if (this.runningExercise) {
      this.addDataToDatabase({
        ...this.runningExercise,
        duration: this.runningExercise.duration * (progress / 100),
        calories: this.runningExercise.calories * (progress / 100),
        date: new Date(),
        state: 'cancelled',
      });
    }
    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  getRunningExercise() {
    return { ...this.runningExercise };
  }

  fetchCompletedOrCancelledExercise() {
    this.fbSubs$.push(
      this.db
        .collection('finishedExercises')
        .valueChanges()
        .subscribe(
          (exercises) => {
            this.finishedExercisesChanged.next(exercises as Exercise[]);
          },
          () => {
            this.uiService.showSnackbar(
              'Fetching Exercises failed, pleased try again later',
              '',
              3000
            );
          }
        )
    );
  }

  cancelSubscription() {
    this.fbSubs$.forEach((sub) => sub.unsubscribe());
  }

  private addDataToDatabase(exercise: Exercise) {
    this.db.collection('finishedExercises').add(exercise);
  }
}
