import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { UiService } from '../shared/ui.service';
import { Exercise } from './exercise.model';

import * as UI from '../shared/ui.actions';
import * as fromTraining from './training.reducer';
import * as Training from './training.actions';
import { Store } from '@ngrx/store';

@Injectable({
  providedIn: 'root',
})
export class TrainingService {
  private fbSubs$: Subscription[] = [];

  constructor(
    private db: AngularFirestore,
    private uiService: UiService,
    private store: Store<fromTraining.State>
  ) {}
  fetchAvailableExercise() {
    this.store.dispatch(new UI.StartLoading());
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
            this.store.dispatch(new UI.StopLoading());
            this.store.dispatch(new Training.SetAvailableTrainings(exercises));
          },
          () => {
            this.store.dispatch(new UI.StopLoading());
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
    this.store.dispatch(new Training.StartTraining(selectedId));
  }

  completeExercise() {
    this.store
      .select(fromTraining.getActiveExercises)
      .pipe(take(1))
      .subscribe((exercise) => {
        if (exercise) {
          this.addDataToDatabase({
            ...exercise,
            date: new Date(),
            state: 'complete',
          });
        }
        this.store.dispatch(new Training.StopTraining());
      });
  }

  cancelExercise(progress: number) {
    this.store
      .select(fromTraining.getActiveExercises)
      .pipe(take(1))
      .subscribe((exercise) => {
        if (exercise) {
          this.addDataToDatabase({
            ...exercise,
            duration: exercise.duration * (progress / 100),
            calories: exercise.calories * (progress / 100),
            date: new Date(),
            state: 'cancelled',
          });
        }
        this.store.dispatch(new Training.StopTraining());
      });
  }

  fetchCompletedOrCancelledExercise() {
    this.fbSubs$.push(
      this.db
        .collection('finishedExercises')
        .valueChanges()
        .subscribe(
          (exercises) => {
            this.store.dispatch(
              new Training.SetFinishedTrainings(exercises as Exercise[])
            );
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
