import { Tone } from "../Tone";
import { optionsFromArguments } from "../util/Defaults";
import { noOp } from "../util/Interface";
import { isString } from "../util/TypeCheck";
import { ToneAudioBuffer } from "./ToneAudioBuffer";
import { assert } from "../util/Debug";

export interface ToneAudioBuffersUrlMap {
	[name: string]: string | AudioBuffer | ToneAudioBuffer;
	[name: number]: string | AudioBuffer | ToneAudioBuffer;
}

interface ToneAudioBuffersOptions {
	urls: ToneAudioBuffersUrlMap;
	onload: () => void;
	onerror?: (error: Error) => void;
	baseUrl: string;
}

/**
 * A data structure for holding multiple buffers in a Map-like datastructure.
 *
 * @example
 * import { Player, ToneAudioBuffers } from "tone";
 * const pianoSamples = new ToneAudioBuffers({
 * 	C1: "https://tonejs.github.io/examples/audio/casio/C1.mp3",
 * 	C2: "https://tonejs.github.io/examples/audio/casio/C2.mp3",
 * }, () => {
 * 	const player = new Player().toDestination();
 * 	// play one of the samples when they all load
 * 	player.buffer = pianoSamples.get("C2");
 * 	player.start();
 * });
 * @example
 * import { ToneAudioBuffers } from "tone";
 * // To pass in additional parameters in the second parameter
 * const buffers = new ToneAudioBuffers({
 * 	 urls: {
 * 		 C1: "C1.mp3",
 * 		 C2: "C2.mp3",
 * 	 },
 * 	 onload: () => console.log("loaded"),
 * 	 baseUrl: "https://tonejs.github.io/examples/audio/casio/"
 * });
 * @category Core
 */
export class ToneAudioBuffers extends Tone {

	readonly name: string = "ToneAudioBuffers";

	/**
	 * All of the buffers
	 */
	private _buffers: Map<string, ToneAudioBuffer> = new Map();

	/**
	 * A path which is prefixed before every url.
	 */
	baseUrl: string;

	/**
	 * Keep track of the number of loaded buffers
	 */
	private _loadingCount = 0;

	/**
	 * @param  urls  An object literal or array of urls to load.
	 * @param onload  The callback to invoke when the buffers are loaded.
	 * @param baseUrl A prefix url to add before all the urls
	 */
	constructor(
		urls?: ToneAudioBuffersUrlMap,
		onload?: () => void,
		baseUrl?: string,
	);
	constructor(options?: Partial<ToneAudioBuffersOptions>);
	constructor() {

		super();
		const options = optionsFromArguments(
			ToneAudioBuffers.getDefaults(), arguments, ["urls", "onload", "baseUrl"], "urls",
		);

		this.baseUrl = options.baseUrl;
		// add each one
		Object.keys(options.urls).forEach(name => {
			this._loadingCount++;
			const url = options.urls[name];
			this.add(name, url, this._bufferLoaded.bind(this, options.onload));
		});

	}

	static getDefaults(): ToneAudioBuffersOptions {
		return {
			baseUrl: "",
			onerror: noOp,
			onload: noOp,
			urls: {},
		};
	}

	/**
	 * True if the buffers object has a buffer by that name.
	 * @param  name  The key or index of the buffer.
	 */
	has(name: string | number): boolean {
		return this._buffers.has(name.toString());
	}

	/**
	 * Get a buffer by name. If an array was loaded,
	 * then use the array index.
	 * @param  name  The key or index of the buffer.
	 */
	get(name: string | number): ToneAudioBuffer {
		assert(this.has(name), `ToneAudioBuffers has no buffer named: ${name}`);
		return this._buffers.get(name.toString()) as ToneAudioBuffer;
	}

	/**
	 * A buffer was loaded. decrement the counter.
	 */
	private _bufferLoaded(callback: () => void): void {
		this._loadingCount--;
		if (this._loadingCount === 0 && callback) {
			callback();
		}
	}

	/**
	 * If the buffers are loaded or not
	 */
	get loaded(): boolean {
		return Array.from(this._buffers).every(([_, buffer]) => buffer.loaded);
	}

	/**
	 * Add a buffer by name and url to the Buffers
	 * @param  name      A unique name to give the buffer
	 * @param  url  Either the url of the bufer, or a buffer which will be added with the given name.
	 * @param  callback  The callback to invoke when the url is loaded.
	 */
	add(
		name: string | number,
		url: string | AudioBuffer | ToneAudioBuffer,
		callback: () => void = noOp,
	): this {
		if (isString(url)) {
			this._buffers.set(name.toString(), new ToneAudioBuffer(this.baseUrl + url, callback));
		} else {
			this._buffers.set(name.toString(), new ToneAudioBuffer(url, callback));
		}
		return this;
	}

	dispose(): this {
		super.dispose();
		this._buffers.forEach(buffer => buffer.dispose());
		this._buffers.clear();
		return this;
	}
}
