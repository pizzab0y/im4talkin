import React, { Component } from 'react';

class AudioRecorder extends Component {
  constructor() {
    super();
    this.state = {
      recordedChunks: [],
      mediaRecorder: null,
      isRecording: false,
    };
  }

  handleSuccess = (stream) => {
    const options = { mimeType: 'audio/webm' };
    const mediaRecorder = new MediaRecorder(stream, options);

    mediaRecorder.addEventListener('dataavailable', (e) => {
      if (e.data.size > 0) {
        this.setState((prevState) => ({
          recordedChunks: [...prevState.recordedChunks, e.data],
        }));
      }
    });

    mediaRecorder.addEventListener('stop', () => {
      const blob = new Blob(this.state.recordedChunks, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.getElementById('download');
      downloadLink.href = url;
      downloadLink.download = 'acetest.wav';
    });

    this.setState({ mediaRecorder });

    const startButton = document.getElementById('start');
    startButton.addEventListener('click', () => {
      mediaRecorder.start();
      this.setState({ isRecording: true });
    });

    const stopButton = document.getElementById('stop');
    stopButton.addEventListener('click', () => {
      mediaRecorder.stop();
      this.setState({ isRecording: false });
    });

    // mediaRecorder.start();
    // this.setState({ isRecording: true });
  };

  componentDidMount() {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then(this.handleSuccess);
  }

  render() {
    return (
      <div>
        <a id="download" download="acetest.wav" className='text-white'>
          Download
        </a>
        <button id="start" disabled={this.state.isRecording} className='text-white'>
          Start
        </button>
        <button id="stop" disabled={!this.state.isRecording} className='text-white'>
          Stop
        </button>
      </div>
    );
  }
}

export default AudioRecorder;
