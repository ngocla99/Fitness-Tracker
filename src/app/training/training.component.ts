import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import * as fromTraining from './training.reducer';
import { Store } from '@ngrx/store';
@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.css'],
})
export class TrainingComponent implements OnInit {
  startTraining$!: Observable<boolean>;
  exerciseSubscription!: Subscription;
  constructor(private store: Store<fromTraining.State>) {}

  ngOnInit(): void {
    this.startTraining$ = this.store.select(fromTraining.getIsTraining);
  }
}
