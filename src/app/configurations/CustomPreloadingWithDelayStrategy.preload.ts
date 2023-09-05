import { Observable, of, mergeMap, timer } from './commonImports';
import { Route, PreloadingStrategy } from '@angular/router';
import { Injectable } from '@angular/core';
@Injectable()
export class CustomPreloadingWithDelayStrategy implements PreloadingStrategy {

    preload(route: Route, load: () => Observable<any>): Observable<any> {
        if (route.data && route.data['preload']) {
            if (route.data['delay']) {
                return timer(route.data['delaytime']).pipe(mergeMap(() => load()));
            }
            return load();
        } else {
            return of(null);
        }
    }

}