import { Observable } from "rxjs";
import { WatchOptions } from "vue";

export function watchAsObservable<T = any>(
	component: Vue,
	cb: () => T,
	options?: WatchOptions
): Observable<T> {
	return new Observable<T>((subscriber) => {
		const unwatch = component.$watch(
			cb,
			(value) => {
				subscriber.next(value);
			},
			options
		);
		return () => {
			unwatch();
		};
	});
}
