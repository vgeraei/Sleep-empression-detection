import React, { useState, useEffect } from "react";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
} from "react-router-dom";

import {
  Button,
  Input,
  Row,
  Col,
  Form,
  Modal,
  Select,
  Steps,
  Space,
  Typography,
  Divider,
  Slider,
  Table,
  InputNumber,
  message,
} from "antd";

import {
  UserOutlined,
  SolutionOutlined,
  LoadingOutlined,
  CaretRightOutlined,
  SmileOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  PauseOutlined,
} from "@ant-design/icons";

import $ from "jquery";
import CustomCheckItem from "../Components/CustomCheckItem";
import axios from "axios";

const { Step } = Steps;
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

function Experiment() {
  const [experimentStarted, setExperimentStarted] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [sleepLevel, setSleepLevel] = useState(5);

  let { userId } = useParams();
  let expressionPackage = "";
  let expressionCounter = 0;
  let timestampCheckpoint;

  var affdex = affdex || {};
  affdex.version = "3.2.1.583-b86b1d2";
  affdex.getAffdexDotJsLocation = function () {
    var scripts = document.getElementsByTagName("script");
    var affdexJS = null;
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src.match(/\/affdex\.js$/)) {
        affdexJS = scripts[i].src.replace(/\/affdex\.js$/, "/");
      }
    }
    return affdexJS;
  };

  affdex.FaceDetectorMode = {
    LARGE_FACES: 0,
    SMALL_FACES: 1,
  };

  // Load worker from XHR url : src=https://gist.github.com/willywongi/5780151
  function XHRWorker(url, ready, scope) {
    /* This loads the source of the worker through a XHR call. This is possible since the server
	   from which we pull the worker source serves files with CORS (Access-Control-Allow-Origin: *).
	   From the source (responseText) we build an inline worker.
	   This works but we need to delegate using the worker when the resource is loaded (XHR call finishes)
	*/
    var oReq = new XMLHttpRequest();
    oReq.addEventListener(
      "load",
      function () {
        var worker = new Worker(
          window.URL.createObjectURL(new Blob([this.responseText]))
        );
        if (ready) {
          ready.call(scope, worker);
        }
      },
      oReq
    );
    oReq.open("get", url, true);
    oReq.setRequestHeader("Access-Control-Allow-Origin", "*");
    oReq.setRequestHeader("Access-Control-Allow-Headers", "*");
    oReq.send();
  }

  affdex.Detector = function () {
    var self = this;

    //Public variables
    self.processFPS = 30;
    self.worker = null;
    self.staticMode = false;
    self.detectEmojis = false;
    self.faceDetectorMode = affdex.FaceDetectorMode.LARGE_FACES;
    self.isWorkerInitialized = false;
    self.isRunning = false;
    self.callbacks = {};

    self.detectExpressions = {
      smile: false,
      innerBrowRaise: false,
      browRaise: false,
      browFurrow: false,
      noseWrinkle: false,
      upperLipRaise: false,
      lipCornerDepressor: false,
      chinRaise: false,
      lipPucker: false,
      lipPress: false,
      lipSuck: false,
      mouthOpen: false,
      smirk: false,
      eyeClosure: false,
      attention: false,
      lidTighten: false,
      jawDrop: false,
      dimpler: false,
      eyeWiden: false,
      cheekRaise: false,
      lipStretch: false,
    };

    self.getCallback = function (event, status) {
      var state = event + "Failure";
      if (status) {
        state = event + "Success";
      }
      if (self.callbacks[state]) {
        return self.callbacks[state];
      } else {
        return function () {};
      }
    };

    var getActiveKeys = function (dictionary) {
      var retArray = [];
      for (var key in dictionary) {
        if (dictionary[key]) {
          retArray.push(key);
        }
      }
      return retArray;
    };

    var setValueForAllKeys = function (dictionary, value) {
      for (var key in dictionary) {
        dictionary[key] = value;
      }
    };

    self.detectAllExpressions = function () {
      setValueForAllKeys(self.detectExpressions, true);
    };

    self.detectAppearance = {
      gender: false,
      glasses: false,
      age: false,
      ethnicity: false,
    };

    self.detectAllAppearance = function () {
      setValueForAllKeys(self.detectAppearance, true);
    };

    self.detectEmotions = {
      joy: false,
      sadness: false,
      disgust: false,
      contempt: false,
      anger: false,
      fear: false,
      surprise: false,
      valence: false,
      engagement: false,
    };

    self.detectAllEmotions = function () {
      setValueForAllKeys(self.detectEmotions, true);
    };

    self.detectAllEmojis = function () {
      self.detectEmojis = true;
    };

    var onWorkerReady = function (status) {
      if (status) {
        self.worker.postMessage({
          message: "start",
          metrics: {
            expressions: getActiveKeys(self.detectExpressions),
            emotions: getActiveKeys(self.detectEmotions),
            appearance: getActiveKeys(self.detectAppearance),
          },
          detectEmojis: self.detectEmojis,
          faceMode: self.faceDetectorMode,
          staticMode: self.staticMode,
          processFPS: self.processFPS,
        });
      } else {
        var msg = "Failed to Initialize the worker";
        self.getCallback("onInitialize", status)(msg);
      }
    };

    self.onWorkerMessage = function (evt) {
      if (evt.data && evt.data.message) {
        var message = evt.data.message;
        var status = evt.data.status;
        switch (message) {
          case "ready":
            onWorkerReady(status);
            break;
          case "started":
            self.onInitialize(status);
            break;
          case "stopped":
            self.onStopped(status);
            break;
          case "reset":
            self.getCallback("onReset", status)();
            break;
          case "results":
            self.onImageResults(status, evt.data);
            break;
        }
      }
    };

    self.reset = function () {
      if (self.isWorkerInitialized) {
        self.worker.postMessage({ message: "reset" });
      } else {
        self.getCallback("onReset", false)("Failed to reset the detector");
      }
    };

    //Callback functions
    self.addEventListener = function (event, fn) {
      self.callbacks[event] = fn;
      return self;
    };

    self.removeEventListener = function (event) {
      delete self.callbacks[event];
      return self;
    };

    self.onStopped = function (status) {
      if (status) {
        self.worker.terminate();
        self.worker = null;
        self.isWorkerInitialized = false;
        self.isRunning = false;
      }
      self.getCallback("onStop", status)();
    };
  };

  //Define the prototypes for the functions that are going to be overrridden
  //By children classes
  affdex.Detector.prototype.start = function () {
    if (!this.isRunning) {
      var url = "https://download.affectiva.com/js/3.2.1/";
      // console.log(url);
      XHRWorker(
        url + "affdex-worker.js",
        function (worker) {
          this.worker = worker;
          this.worker.onmessage = this.onWorkerMessage;
          this.worker.postMessage({ message: "ctor", url: url });
          this.isRunning = true;
        },
        this
      );
    } else {
      this.getCallback(
        "onInitialize",
        false
      )("Failed to start the detector, it is already running");
    }
  };

  affdex.Detector.prototype.onImageResults = function (status, data) {
    if (status) {
      this.getCallback("onImageResults", status)(
        data.faces,
        data.img,
        data.time
      );
    } else {
      this.getCallback("onImageResults", status)(
        data.img,
        data.time,
        data.detail
      );
    }
  };

  affdex.Detector.prototype.onInitialize = function (status) {
    if (status) {
      this.isWorkerInitialized = true;
    }
    this.getCallback(
      "onInitialize",
      status
    )("Failed to Initialize the detectors");
  };

  affdex.Detector.prototype.stop = function () {
    if (this.isWorkerInitialized) {
      this.worker.postMessage({ message: "stop" });
    } else {
      this.getCallback(
        "onStop",
        false
      )("Failed to stop the detector, it is not running");
    }
  };

  affdex.CameraDetector = function (element, imgW, imgH, faceMode) {
    var self = this;
    affdex.Detector.call(self);
    var cameraStream = null;
    var width = imgW || 640;
    var height = imgH || 480;
    var startTimeStamp = new Date().getTime() / 1000;
    var docElement = element || document.createElement("div");
    var canvasElement = null;
    var canvasContext = null;
    var adapterJSVersion = "adapter-1.4.0.js";

    self.faceDetectorMode =
      typeof faceMode == "undefined"
        ? affdex.FaceDetectorMode.LARGE_FACES
        : faceMode;

    var ctor = function () {
      self.videoElement = document.createElement("video");
      self.videoElement.id = "face_video";
      self.videoElement.autoplay = true;
      docElement.appendChild(self.videoElement);
      startTimeStamp = new Date().getTime() / 1000;
      canvasElement = document.createElement("canvas");
      canvasElement.id = "face_video_canvas";
      canvasElement.width = width;
      canvasElement.height = height;
      canvasElement.style.display = "none";
      docElement.appendChild(canvasElement);
      canvasContext = canvasElement.getContext("2d");
    };

    var dtor = function () {
      if (self.videoElement) {
        self.videoElement.remove();
      }
      if (canvasElement) {
        canvasElement.remove();
      }
      self.videoElement = null;
      canvasElement = null;
    };

    var captureImage = function () {
      if (self.isWorkerInitialized && canvasElement) {
        canvasContext.clearRect(
          0,
          0,
          canvasElement.width,
          canvasElement.height
        );
        canvasContext.drawImage(self.videoElement, 0, 0, width, height);
        var imgData = canvasContext.getImageData(
          0,
          0,
          canvasElement.width,
          canvasElement.height
        );
        var currentTimeStamp = new Date().getTime() / 1000;
        process(imgData, currentTimeStamp - startTimeStamp);
      }
    };

    self.onWebcamReady = function (stream) {
      cameraStream = stream;
      self.videoElement.addEventListener("canplay", function () {
        self.videoElement.play();
      });

      var playingFn = function () {
        self.videoElement.removeEventListener("playing", self);
        //Call parent function
        affdex.Detector.prototype.start.apply(self);
      };

      self.videoElement.addEventListener("playing", playingFn);
      self.videoElement.srcObject = stream;

      self.getCallback("onWebcamConnect", true)();
    };

    var require = function (rootDiv, file, success_callback, failure_callback) {
      var node = document.createElement("script");
      node.type = "text/javascript";
      node.src = file;
      node.onload = success_callback;
      node.onerror = function (err) {
        failure_callback("Error loading js file: " + file);
      };
      rootDiv.appendChild(node);
    };

    var process = function (img, timeStamp) {
      if (self.isWorkerInitialized) {
        self.worker.postMessage({
          message: "process",
          img: img,
          time: timeStamp,
        });
      }
    };

    self._startCamera = function () {
      navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: false,
        })
        .then(self.onWebcamReady)
        .catch(self.getCallback("onWebcamConnect", false));
    };

    self.start = function () {
      if (!self.isRunning) {
        ctor();
        var url = "https://download.affectiva.com/js/3.2.1/" + adapterJSVersion;
        require(docElement, url, function () {
          self._startCamera();
        }, function () {
          self.getCallback(
            "onInitialize",
            false
          )("Unable to load adaptor.js to load the camera");
        });
      }
    };

    self.onInitialize = function (status) {
      //Call parent function
      affdex.Detector.prototype.onInitialize.call(self, status);
      if (status) {
        captureImage();
      }
    };

    self.onImageResults = function (status, data) {
      captureImage();
      affdex.Detector.prototype.onImageResults.call(self, status, data);
    };

    self.stop = function () {
      if (cameraStream && typeof cameraStream.getTracks != "undefined") {
        var tracks = cameraStream.getTracks();
        tracks.forEach(function (track, idx, arr) {
          track.stop();
        });
      }
      dtor();

      //Call parent function
      affdex.Detector.prototype.stop.call(self);
    };
  };

  affdex.FrameDetector = function (faceMode) {
    var self = this;
    affdex.Detector.call(self);

    self.faceDetectorMode =
      typeof faceMode == "undefined"
        ? affdex.FaceDetectorMode.LARGE_FACES
        : faceMode;

    self.start = function () {
      affdex.Detector.prototype.start.call(self);
    };

    self.onInitialize = function (status) {
      //Call parent function
      affdex.Detector.prototype.onInitialize.call(self, status);
    };

    self.onImageResults = function (status, data) {
      affdex.Detector.prototype.onImageResults.call(self, status, data);
    };
    self.stop = function () {
      affdex.Detector.prototype.stop.call(self);
    };
  };

  affdex.FrameDetector.prototype.process = function (img, timeStamp) {
    if (this.isWorkerInitialized) {
      this.worker.postMessage({
        message: "process",
        img: img,
        time: timeStamp,
      });
    } else {
      this.getCallback("onImageResults", false)(
        img,
        timeStamp,
        "the detector is not initialized"
      );
    }
  };

  affdex.PhotoDetector = function (faceMode) {
    var self = this;
    affdex.FrameDetector.call(self);
    self.staticMode = true;
    self.faceDetectorMode =
      typeof faceMode == "undefined"
        ? affdex.FaceDetectorMode.SMALL_FACES
        : faceMode;

    self.process = function (img, timeStamp) {
      affdex.FrameDetector.prototype.process.call(self, img, timeStamp);
    };
  };
  let detector;

  const marks = {
    1: {
      label: (
        <span role="img" aria-label="Normal" style={{ fontSize: 26 }}>
          ☕
        </span>
      ),
    },
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: {
      label: (
        <span role="img" aria-label="Sleepy" style={{ fontSize: 26 }}>
          😴
        </span>
      ),
    },
  };

  // //function executes when Start button is pushed.
  let startFunc = function onStart() {
    setExperimentStarted(true);
    console.log(detector);
    if (detector && !detector.isRunning) {
      //     $("#logs").html("");
      detector.start();
    }
    message.info("آزمایش شروع شد.");

    // setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    axios
      .post("/save-sleep-level/", {
        timestamp: Date.now(),
        userId: userId,
        level: sleepLevel,
      })
      .then((response) => {
        // setRegisterLoading(false);
        message.success("وضعیت خواب آلودگی با موفقیت ثبت شد.");
      })
      .catch(() => {
        message.warning("بروز مشکل در ثبت وضعیت خواب آلودگی");
      });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // //function executes when the Stop button is pushed.
  let stopFunc = function onStop() {
    setExperimentStarted(false);
    console.log(detector);
    message.info("آزمایش متوقف شد.");
    if (detector && detector.isRunning) {
      detector.removeEventListener();
      detector.stop();
    }
  };

  // //function executes when the Reset button is pushed.
  let resetFunc = function onReset() {
    message.info("Clicked the reset button");
    if (detector && detector.isRunning) {
      detector.reset();

      $("#results").html("");
    }
  };

  // //Draw the detected facial feature points on the image
  function drawFeaturePoints(img, featurePoints) {
    var contxt = $("#face_video_canvas")[0].getContext("2d");

    var hRatio = contxt.canvas.width / img.width;
    var vRatio = contxt.canvas.height / img.height;
    var ratio = Math.min(hRatio, vRatio);

    contxt.strokeStyle = "#FFFFFF";
    for (var id in featurePoints) {
      contxt.beginPath();
      contxt.arc(featurePoints[id].x, featurePoints[id].y, 2, 0, 2 * Math.PI);
      contxt.stroke();
    }
  }

  useEffect(() => {
    // // SDK Needs to create video and canvas nodes in the DOM in order to function
    // // Here we are adding those nodes a predefined div.
    timestampCheckpoint = Date.now();
    var divRoot = $("#affdex_elements")[0];
    var width = 320;
    var height = 240;
    var faceMode = affdex.FaceDetectorMode.LARGE_FACES;
    // //Construct a CameraDetector and specify the image width / height and face detector mode.
    detector = new affdex.CameraDetector(divRoot, width, height, faceMode);
    // //Enable detection of all Expressions, Emotions and Emojis classifiers.
    detector.detectAllEmotions();
    detector.detectAllExpressions();
    detector.detectAllEmojis();
    detector.detectAllAppearance();

    // //Add a callback to notify when the detector is initialized and ready for runing.
    detector.addEventListener("onInitializeSuccess", function () {
      message.info("The detector reports initialized");
      //   //Display canvas instead of video feed because we want to draw the feature points on it
      $("#face_video_canvas").css("display", "block");
      $("#face_video").css("display", "none");
    });

    // //Add a callback to notify when camera access is allowed
    detector.addEventListener("onWebcamConnectSuccess", function () {
      message.info("Webcam access allowed");
    });

    // //Add a callback to notify when camera access is denied
    detector.addEventListener("onWebcamConnectFailure", function () {
      message.info("Webcam access denied");
      //   console.log("Webcam access denied");
    });

    // //Add a callback to notify when detector is stopped
    detector.addEventListener("onStopSuccess", function () {
      message.info("The detector reports stopped");
      $("#results").html("");
    });

    // //Add a callback to receive the results from processing an image.
    // //The faces object contains the list of the faces detected in an image.
    // //Faces object contains probabilities for all the different expressions, emotions and appearance metrics
    detector.addEventListener(
      "onImageResultsSuccess",
      function (faces, image, timestamp) {
        $("#results").html("");

        // console.log("Timestamp: " + timestamp.toFixed(2));
        // console.log("Number of faces found: " + faces.length);
        if (faces.length == 1) {
          // console.log(
          //   "#results",
          //   "Appearance: " + JSON.stringify(faces[0].appearance)
          // );
          // console.log(
          //   "#results",
          //   "Emotions: " +
          //     JSON.stringify(faces[0].emotions, function (key, val) {
          //       return val.toFixed ? Number(val.toFixed(0)) : val;
          //     })
          // );
          // console.log(
          //   "#results",
          //   "Expressions: " +
          //     JSON.stringify(faces[0].expressions, function (key, val) {
          //       return val.toFixed ? Number(val.toFixed(0)) : val;
          //     })
          // );
          // console.log(faces[0].expressions);
          // console.log("#results", "Emoji: " + faces[0].emojis.dominantEmoji);

          expressionCounter += 1;

          let tempExps = faces[0].expressions;
          tempExps.timestamp = Date.now();

          tempExps = {
            ts: Date.now(),
            a: faces[0].expressions.smile,
            b: faces[0].expressions.innerBrowRaise,
            c: faces[0].expressions.browRaise,
            d: faces[0].expressions.browFurrow,
            e: faces[0].expressions.noseWrinkle,
            f: faces[0].expressions.upperLipRaise,
            g: faces[0].expressions.lipCornerDepressor,
            h: faces[0].expressions.chinRaise,
            i: faces[0].expressions.lipPucker,
            j: faces[0].expressions.lipPress,
            k: faces[0].expressions.lipSuck,
            l: faces[0].expressions.mouthOpen,
            m: faces[0].expressions.smirk,
            n: faces[0].expressions.eyeClosure,
            o: faces[0].expressions.attention,
            p: faces[0].expressions.lidTighten,
            q: faces[0].expressions.jawDrop,
            r: faces[0].expressions.dimpler,
            s: faces[0].expressions.eyeWiden,
            t: faces[0].expressions.cheekRaise,
            u: faces[0].expressions.lipStretch,
          };

          expressionPackage =
            expressionPackage +
            " * " +
            JSON.stringify(tempExps, function (key, val) {
              return val.toFixed ? Number(val.toFixed(0)) : val;
            });

          if (expressionCounter == 500) {
            expressionCounter = 0;
            let requestData = expressionPackage;
            expressionPackage = "";
            axios
              .post("/handle-emotion-data/", {
                data: requestData,
                userId: userId,
              })
              .then((response) => {
                // setRegisterLoading(false);

                message.success("وضعیت با موفقیت ارسال شد.");

                let tempTime = Date.now();
                console.log(
                  tempTime - timestampCheckpoint,
                  tempTime,
                  timestampCheckpoint
                );
                if (tempTime - timestampCheckpoint > 30 * 60 * 1000) {
                  timestampCheckpoint = Date.now();
                  setIsModalVisible(true);
                }
              })
              .catch(() => {
                message.warning("بروز مشکل در ارسال وضعیت.");
              });
          }

          // console.log(expressionCounter);

          if ($("#face_video_canvas")[0] != null)
            drawFeaturePoints(image, faces[0].featurePoints);
        }
      }
    );
    //   return () => {};
  }, []);

  const dataSource = [
    {
      key: "1",
      number: 1,
      feel: "به شدت هوشیار",
    },
    {
      key: "2",
      number: 2,
      feel: "بسیار هوشیار",
    },
    {
      key: "3",
      number: 3,
      feel: "هوشیار",
    },
    {
      key: "4",
      number: 4,
      feel: "نسبتا هوشیار",
    },
    {
      key: "5",
      number: 5,
      feel: "نه خواب آاود و نه حس هشیار",
    },
    {
      key: "6",
      number: 6,
      feel: "بعضی نشانه های خواب آلودگی",
    },
    {
      key: "7",
      number: 7,
      feel: "خواب آلود بهیچ تلاشی در بیدار ماندن نمیکند",
    },
    {
      key: "8",
      number: 8,
      feel: "خواب آلود،  تلاش برای بیداری ماندن",
    },
    {
      key: "9",
      number: 9,
      feel: "بسیار خواب آلود، تلاش بسیار زیادی برای بیداری و در حال مبارزه با خوابیدن",
    },
  ];

  const columns = [
    {
      title: "#",
      dataIndex: "number",
      key: "number",
      width: 30,
    },
    {
      title: "احساس",
      dataIndex: "feel",
      key: "feel",
    },
  ];

  // <Button
  //   icon={<PauseOutlined />}
  //   onClick={stopFunc}
  //   disabled={!experimentStarted}
  // >
  //   توقف
  // </Button>;

  return (
    <div
      className="site-layout-background"
      style={{ padding: "8%", minHeight: 380 }}
    >
      <Row justify="center" style={{ margin: "0 0 50px 0" }}>
        <Steps style={{ width: "80%" }}>
          <Step status="finish" title="ورود" icon={<UserOutlined />} />
          <Step status="finish" title="ثبت نام" icon={<SolutionOutlined />} />

          <Step status="finish" title="آزمایش" icon={<SmileOutlined />} />
        </Steps>
      </Row>
      <Row>
        <Col span={12} className="experiment-main-column">
          <Paragraph>
            داوطلب گرامی، پیش از شروع آزمایش نکات زیر را مطالعه کرده از برقراری
            آنها اطمینان حاصل کنید.
          </Paragraph>
          <Divider />
          <CustomCheckItem text="صورت شما توسط دوربین تشخیص داده شده باشد." />
          <CustomCheckItem text="هر ۳۰ دقیقه برای اعلام وضعیت خواب آلودگی به صفحه مراجعه کنید." />
          <CustomCheckItem text="در هنگام آزماش به روال عادی استفاده از رایانه خود بپردازید. " />
        </Col>
        <Col span={12} className="experiment-main-column">
          <Row style={{ marginBottom: 20 }}>
            <Space>
              <Button
                type="primary"
                icon={<CaretRightOutlined />}
                onClick={startFunc}
                disabled={experimentStarted}
              >
                شروع آزمایش
              </Button>
            </Space>
          </Row>

          <div id="affdex_elements"></div>

          <div id="results" style={{ wordWrap: "break-word" }}></div>

          <div id="logs"></div>
        </Col>
      </Row>

      <Modal
        title="سطح خواب آلودگی"
        visible={isModalVisible}
        closable={false}
        footer={[
          <Button key="submit" type="primary" onClick={handleOk}>
            ثبت
          </Button>,
        ]}
      >
        <p>
          لطفا از ۱ (کاملا آگاه) تا ۱۰ (بسیار خوابالود) به سطح خواب آلودگی خود
          نمره دهید.
        </p>
        <Slider
          marks={marks}
          step={1}
          min={1}
          max={9}
          defaultValue={5}
          onChange={(value) => {
            setSleepLevel(value);
          }}
        ></Slider>
        <Table
          style={{ marginTop: 50 }}
          dataSource={dataSource}
          columns={columns}
          size="small"
          scroll={{ y: 250 }}
          pagination={false}
        />
      </Modal>
    </div>
  );
}

export default Experiment;
