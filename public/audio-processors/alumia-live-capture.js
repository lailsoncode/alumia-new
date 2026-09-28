class AlumiaLiveCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.pendingInput = new Float32Array(0);
    this.position = 0;
    this.output = [];
    this.ratio = sampleRate / 16000;
  }

  process(inputs) {
    const input = inputs[0]?.[0];
    if (!input?.length) return true;

    const joined = new Float32Array(this.pendingInput.length + input.length);
    joined.set(this.pendingInput);
    joined.set(input, this.pendingInput.length);

    while (this.position < joined.length - 1) {
      const left = Math.floor(this.position);
      const fraction = this.position - left;
      const sample = joined[left] + (joined[left + 1] - joined[left]) * fraction;
      this.output.push(Math.max(-1, Math.min(1, sample)));
      this.position += this.ratio;
    }

    const consumed = Math.floor(this.position);
    this.pendingInput = joined.slice(consumed);
    this.position -= consumed;

    if (this.output.length >= 1600) {
      const pcm = new Int16Array(this.output.length);
      for (let index = 0; index < this.output.length; index += 1) {
        const value = this.output[index];
        pcm[index] = value < 0 ? value * 0x8000 : value * 0x7fff;
      }
      this.output = [];
      this.port.postMessage(pcm.buffer, [pcm.buffer]);
    }
    return true;
  }
}

registerProcessor("alumia-live-capture", AlumiaLiveCaptureProcessor);
