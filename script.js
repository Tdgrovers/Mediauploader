const button = document.getElementById("uploadButton");
const status = document.getElementById("status");
const result = document.getElementById("result");


button.onclick = async () => {

    const fileInput = document.getElementById("audioFile");
    const nameInput = document.getElementById("songName");


    if (!fileInput.files.length) {
        alert("Choose a file first");
        return;
    }


    let file = fileInput.files[0];

    let name = nameInput.value || 
        file.name.replace(/\.[^/.]+$/, "");


    status.innerHTML = "Loading converter...";


    const { FFmpeg } = FFmpegWASM;


    const ffmpeg = new FFmpeg();


    await ffmpeg.load();


    status.innerHTML = "Converting to OGG...";


    await ffmpeg.writeFile(
        file.name,
        await fetch(URL.createObjectURL(file))
            .then(r => r.arrayBuffer())
    );


    await ffmpeg.exec([
        "-i",
        file.name,
        "-c:a",
        "libvorbis",
        `${name}.ogg`
    ]);


    const data = await ffmpeg.readFile(`${name}.ogg`);


    status.innerHTML = "Uploading...";


    const form = new FormData();

    form.append(
        "fileToUpload",
        new Blob([data], {type:"audio/ogg"}),
        `${name}.ogg`
    );


    const upload = await fetch(
        "https://catbox.moe/user/api.php",
        {
            method:"POST",
            body:form
        }
    );


    const url = await upload.text();


    status.innerHTML = "Done!";


    result.textContent =
`/phonon add ${name} ${url}`;

};
