export class Observer {
	private subscribers: Array<Function> = [];
	private value;
	private object;

	constructor(object: Object, field: string) {
		this.value = object[field];
		this.object = object;
		Object.defineProperty(object, field, {
			get: () => {
				// console.log("getter!");
				return this.value;
			},
			set: (newValue) => {
				var oldValue = this.value;
				this.value = newValue;
				// console.log("setter!");
				if (oldValue != newValue)
					this.valueChanged(newValue, oldValue);
			}
		});
	}

	private valueChanged(newValue, oldValue) {
		for (let subscriber of this.subscribers) {
			subscriber.call(this.object, newValue, oldValue);
		}
	}

	subscribe(subscriber: Function) {
		this.subscribers.push(subscriber);
		return this;
	}

	unsubscribe(subscriber: Function) {
		var index = this.subscribers.indexOf(subscriber);
		if (index > -1) {
			this.subscribers.splice(index, 1);
		}
		return this;
	}

	dispose() {
		this.subscribers = [];
	}
}