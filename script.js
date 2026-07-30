const button = document.getElementById("uploadButton");
const status = document.getElementById("status");
const result = document.getElementById("result");
const logBox = document.getElementById("log");


function log(message) {
    console.log(message);

    logBox.textContent += 
        `[${new Date().toLocaleTimeString()}] ${message}\n`;
}


button.onclick = async () => {

    try {

        const fileInput = document.getElementById("audioFile");
        const nameInput = document.getElementById("songName");


        if (!fileInput.files.length) {
            alert("Choose a file first");
            return;
        }


        const file = fileInput.files[0];

        const name = nameInput.value ||
            file.name.replace(/\.[^/.]+$/, "");


        log("Selected file: " + file.name);
        log("Size: " + 
            (file.size / 1024 / 1024).toFixed(2)
            + " MB");


        status.innerText =
            "Loading converter...";


        log("Checking FFmpeg...");
        log(
            "FFmpeg object: "
            + typeof FFmpeg
        );


        if (!FFmpeg) {
            throw new Error(
                "FFmpeg library not loaded"
            );
        }


        log("FFmpeg library found");


        const ffmpeg = FFmpeg.createFFmpeg({
            log: true
        });


        ffmpeg.on(
            "log",
            ({message}) => {
                log(
                    "FFmpeg: " + message
                );
            }
        );


        ffmpeg.on(
            "progress",
            ({progress}) => {
                status.innerText =
                    "Converting: "
                    +
                    Math.round(progress * 100)
                    +
                    "%";
            }
        );


        log("Starting FFmpeg download...");

        log("Loading FFmpeg core...");
        await ffmpeg.load();


        log("FFmpeg loaded successfully");


        status.innerText =
            "Reading file...";


        const buffer =
            await file.arrayBuffer();


        await ffmpeg.writeFile(
            file.name,
            new Uint8Array(buffer)
        );


        log("Input file loaded into FFmpeg");


        status.innerText =
            "Converting to OGG...";


        await ffmpeg.exec([
            "-i",
            file.name,
            "-c:a",
            "libvorbis",
            `${name}.ogg`
        ]);


        log("Conversion complete");


        const output =
            await ffmpeg.readFile(
                `${name}.ogg`
            );


        log(
            "OGG size: "
            +
            (output.length / 1024 / 1024)
                .toFixed(2)
            +
            " MB"
        );


        status.innerText =
            "Uploading to Catbox...";


        const form =
            new FormData();


        form.append(
            "fileToUpload",
            new Blob(
                [output],
                {
                    type:"audio/ogg"
                }
            ),
            `${name}.ogg`
        );


        log("Uploading...");


        const response =
            await fetch(
                "https://catbox.moe/user/api.php",
                {
                    method:"POST",
                    body:form
                }
            );


        const url =
            await response.text();


        log(
            "Catbox response: "
            + url
        );


        result.textContent =
`/phonon add ${name} ${url}`;


        status.innerText =
            "Finished!";


    } catch(error) {

        status.innerText =
            "ERROR";

        log(
            "ERROR: "
            + error.message
        );

        console.error(error);

    }

};
