import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ApiService } from '../services/api.service';
import * as ItemActions from './actions';

@Injectable()
export class ItemEffects {
  
  loadItems$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ItemActions.loadItems),
      mergeMap(() =>
        this.apiService.getDailyTip().pipe(
          map((items) => ItemActions.loadItemsSuccess({ items })),
          catchError((error) =>
            of(ItemActions.loadItemsFailure({ error: error.message }))
          )
        )
      )
    )
  );
  constructor(private actions$: Actions, private apiService: ApiService) {}
}