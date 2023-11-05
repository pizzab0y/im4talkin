import React, { Component } from 'react';

class AudioRecorder extends Component {
  constructor() {
    super();
    this.state = {
      recordedChunks: [],
      mediaRecorder: null,
      isRecording: false,
      audioDuration: 0,
    };
    this.audioDurationElement = React.createRef();
  }

  handleSuccess = (stream) => {
    const options = { mimeType: 'audio/webm' };
    const mediaRecorder = new MediaRecorder(stream, options);
    const startButton = document.getElementById('start');
    const stopButton = document.getElementById('stop');
    
    this.setState({ mediaRecorder });

    let audioStartTime = 0;
    
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

      this.setState({ isRecording: false });
    });

    startButton.addEventListener('click', () => {
      mediaRecorder.start();
      audioStartTime = Date.now();
      this.setState({
        isRecording: true,
        recordedChunks: [],
       });
    });

    stopButton.addEventListener('click', () => {
      mediaRecorder.stop();
      const audioEndTime = Date.now(); // Add this line
      const durationInSeconds = (audioEndTime - audioStartTime) / 1000;
      this.setState({
        isRecording: false,
        audioDuration: durationInSeconds,
       });
      if (this.audioDurationElement.current) {
        this.audioDurationElement.current.innerText = `Audio Duration: ${durationInSeconds.toFixed(2)} seconds`;
      }
    });
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
        <button id="start" disabled={this.state.isRecording} className='text-green-700'>
          {this.state.isRecording ? 'Recording' : 'Start'}
        </button>
        <button id="stop" disabled={!this.state.isRecording} className='text-red-700'>
          Stop
        </button>
        <div>
          <p className='text-neutral-500'> Audio Duration: {this.state.audioDuration.toFixed(2)} seconds</p>
        </div>
      </div>
    );
  }
}

export default AudioRecorder;

// // Check the permission policy set to the current user
// navigator.permissions.query({name: 'microphone'}).then(function (result) {
//   if (result.state == 'granted') {
//   } else if (result.state == 'prompt') {
//   } else if (result.state == 'denied') {
//   }
//   result.onchange = function () {};
// });
