import Vue from "vue";
import { Observable } from "rxjs";
import { WatchOptions } from "vue";

export function watchAsObservable<T = any, VueType extends Vue = Vue>(
	component: VueType,
	watcher: string | ((this: VueType) => T),
	options?: WatchOptions
): Observable<T> {
	return new Observable<T>((subscriber) => {
		const unwatch = component.$watch(
			watcher as any,
			function (value: any) {
				subscriber.next(value);
			},
			options
		);
		return () => {
			unwatch();
		};
	});
}
