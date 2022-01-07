import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-stop-training',
  template: `
    <section fxLayout="column" fxLayoutAlign="center center">
      <h1 mat-dialog-title>Are you sure?</h1>
      <mat-dialog-content
        >You're already got {{ data.progress }}%</mat-dialog-content
      >
      <mat-dialog-actions>
        <button mat-button [mat-dialog-close]="true">Yes</button>
        <button mat-raised-button color="accent" [mat-dialog-close]="false">
          No
        </button>
      </mat-dialog-actions>
    </section>
  `,
})
export class StopTrainingComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { progress: number }) {}
}
