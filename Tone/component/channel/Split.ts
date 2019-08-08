import { ToneAudioNode, ToneAudioNodeOptions } from "../../core/context/ToneAudioNode";
import { optionsFromArguments } from "../../core/util/Defaults";

interface SplitOptions extends ToneAudioNodeOptions {
	channels: number;
}

/**
 * Split splits an incoming signal into the number of given channels.
 *
 * @param channels The number of channels to merge.
 * @example
 * var split = new Split();
 * stereoSignal.connect(split);
 */
export class Split extends ToneAudioNode<SplitOptions> {
	readonly name = "Split";

	/**
	 * The splitting node
	 */
	private _splitter: ChannelSplitterNode;

	readonly input: ChannelSplitterNode;
	readonly output: ChannelSplitterNode;

	constructor(channels?: number);
	// tslint:disable-next-line: unified-signatures
	constructor(options?: Partial<SplitOptions>);
	constructor() {
		super(optionsFromArguments(Split.getDefaults(), arguments, ["channels"]));
		const options = optionsFromArguments(Split.getDefaults(), arguments, ["channels"]);

		this._splitter = this.input = this.output = this.context.createChannelSplitter(options.channels);
		this._internalChannels = [this._splitter];
	}

	static getDefaults(): SplitOptions {
		return Object.assign(ToneAudioNode.getDefaults(), {
			channels: 2,
		});
	}

	dispose(): this {
		super.dispose();
		this._splitter.disconnect();
		return this;
	}
}