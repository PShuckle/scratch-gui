import "regenerator-runtime/runtime";

export default async function (displayMediaOptions) {
    const videoOutput = document.getElementById("video");

    let captureStream = null;
  
    try {
      captureStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    } catch(err) {
      console.error("Error: " + err);
    }

    console.log(captureStream);

    videoOutput.srcObject = captureStream;

    return captureStream;
  }

