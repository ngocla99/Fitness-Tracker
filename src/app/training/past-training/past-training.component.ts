import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { Exercise } from '../exercise.model';
import { TrainingService } from '../training.service';

@Component({
  selector: 'app-past-training',
  templateUrl: './past-training.component.html',
  styleUrls: ['./past-training.component.css'],
})
export class PastTrainingComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns = ['date', 'name', 'duration', 'calories', 'state'];
  dataSource!: MatTableDataSource<Exercise>;

  finishedExercisesSub$!: Subscription;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private trainingService: TrainingService) {}

  ngOnInit(): void {
    this.trainingService.fetchCompletedOrCancelledExercise();
    this.finishedExercisesSub$ =
      this.trainingService.finishedExercisesChanged.subscribe((exercise) => {
        this.dataSource = new MatTableDataSource(exercise);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      });
  }

  ngAfterViewInit(): void {
    // if (!this.dataSource) return;
    // this.dataSource.sort = this.sort;
    // this.dataSource.paginator = this.paginator;
  }

  onFilter(event: Event) {
    const target = event.target as HTMLInputElement;
    const filterValue = target.value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ngOnDestroy() {
    if (this.finishedExercisesSub$) {
      this.finishedExercisesSub$.unsubscribe();
    }
  }
}
