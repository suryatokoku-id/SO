const API="https://script.google.com/macros/s/AKfycbxVQZgfKu8KlYlzbAkPORmcTR0zX1DKJ5W_0Qeqctu6jQKihP7kwQR4ujKnso4SuaUS/exec";

let MASTER=[];
let produk=null;
let scanner=null;

const audioSukses=
new Audio(
"https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
);

const audioError=
new Audio(
"https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg"
);

let MASTER_MAP={};


window.onload=async()=>{

await loadMaster();

};

function updatePetugas(){

const tim=
document.getElementById("tim").value;

const petugas=
document.getElementById("petugas");


petugas.innerHTML=

'<option value="">Pilih Petugas</option>';


let daftar=[];


if(tim=="Surtok"){

daftar=[

"Asep",
"Dudi",
"Riki",
"Yanto",
"Ridwan",
"Janwar",
"Ozi",
"Wildan"

];

}


if(tim=="Audit"){

daftar=[

"Agung",
"Rilo",
"Maul",
"Asep",
"Rahman",
"Wildan",
"Ozi",
"Riki"

];

}


daftar.forEach(nama=>{

petugas.innerHTML+=

`<option>${nama}</option>`;

});

}



async function loadMaster(){

const statusDiv=
document.getElementById("masterStatus");

const scanBtn=
document.getElementById("btnScan");

const scanInput=
document.getElementById("scanInput");


scanBtn.disabled=true;
scanInput.disabled=true;


try{

statusDiv.innerHTML=

`🔄 Memuat master produk...
<br>
mohon tunggu dulu..`;


const res=

await fetch(

API+
"?action=master&t="+
Date.now(),

{
cache:"no-store"
}

);


const data=
await res.json();


MASTER=[];

MASTER_MAP={};

(data.data||[])

.forEach(item=>{

const obj={

kode:
String(item.kode||"")
.trim()
.toUpperCase(),

nama:
String(item.nama||""),

barcode:
String(item.barcode||"")
.trim()
.toUpperCase()

};

MASTER.push(obj);

MASTER_MAP[obj.kode]=obj;
MASTER_MAP[obj.barcode]=obj;

});


scanBtn.disabled=false;
scanInput.disabled=false;


statusDiv.innerHTML=

"✅ Siap mulai hitung";


scanInput.focus();

}
catch(err){

console.log(err);

statusDiv.innerHTML=

`❌ Gagal memuat master
<br>
Hubungi development`;

}

}



async function bukaScanner(){

try{

const reader=
document.getElementById(
"reader"
);

reader.style.display=
"block";


if(scanner){

await scanner.stop();
await scanner.clear();

scanner=null;

reader.innerHTML="";
reader.style.display="none";

return;

}


scanner=
new Html5Qrcode(
"reader"
);


await scanner.start(

{
facingMode:"environment"
},

{
fps:10,
qrbox:250
},

hasilScan

);

}
catch(err){

console.log(err);

alert(
"Gagal membuka kamera"
);

}

}



async function hasilScan(text){

document
.getElementById(
"scanInput"
)
.value=text;


bunyiBeep();


cariProduk(
text
);


if(scanner){

await scanner.stop();

await scanner.clear();

scanner=null;

}


document
.getElementById(
"reader"
)
.style.display="none";

}



function bunyiBeep(){

const audio=

new Audio(

"https://actions.google.com/sounds/v1/alarms/beep_short.ogg"

);

audio.play();

}



/* scanner usb + manual */

function cekInput(e){

if(

e.key==="Enter" ||

e.key==="NumpadEnter" ||

e.key==="Tab"

){

e.preventDefault();

setTimeout(()=>{

const input=

document
.getElementById(
"scanInput"
)
.value
.trim();


if(!input){

return;

}


cariProduk(
input
);

},100);

}

}

function cekBlur(){

const input=

document
.getElementById(
"scanInput"
)
.value
.trim();


if(!input){

return;

}


/* reset produk lama */

produk=null;


/* cari ulang */

cariProduk(
input
);

}

function cariProduk(input){

input=

String(input)
.trim()
.toUpperCase();


produk=null;


produk=

MASTER_MAP[input];


if(!produk){

bunyiError();

document
.getElementById(
"produk"
)
.innerHTML=

"❌ Data tidak ditemukan";


document
.getElementById(
"scanInput"
)
.value="";


setTimeout(()=>{

document
.getElementById(
"produk"
)
.innerHTML=

"Belum ada produk";


document
.getElementById(
"scanInput"
)
.focus();

},3000);

return;

}


bunyiSukses();


document
.getElementById(
"produk"
)
.innerHTML=

`

<b>${produk.nama}</b>

<br><br>

Kode:
${produk.kode}

<br>

Barcode:
${produk.barcode}

`;


document
.getElementById(
"qty"
)
.focus();

}



async function simpan(){

const btn=
document.querySelector(
'button.btnBiru'
);


if(

!document.getElementById("tim").value ||

!document.getElementById("petugas").value ||

!document.getElementById("rak").value

){

tampilPopup(
"⚠️ Harap pilih tim,<br><br>isi nama petugas dan rak"
);

return;

}


if(!produk){

tampilPopup(
"⚠️ Harap scan atau pilih produk"
);

return;

}


/* lock tombol */

btn.disabled=true;

btn.style.opacity="0.5";

btn.innerHTML="Menyimpan...";


const body={

action:"save",

tim:
document.getElementById("tim").value,

petugas:
document.getElementById("petugas").value,

rak:
document.getElementById("rak").value,

kode:
produk.kode,

nama:
produk.nama,

barcode:
produk.barcode,

qty:
document.getElementById("qty").value

};


try{

const res=

await fetch(

API,

{

method:"POST",

body:JSON.stringify(body)

}

);


const data=
await res.json();


if(!data.status){

throw new Error();

}


/* reset form setelah benar-benar sukses */

document.getElementById(
"scanInput"
).value="";

document.getElementById(
"qty"
).value="";

document.getElementById(
"produk"
).innerHTML=
"Belum ada produk";

produk=null;

document.getElementById(
"scanInput"
).focus();

}
catch(err){

console.log(err);

tampilPopup(

"❌ Gagal menyimpan<br><br>Cek internet"

);

}

/* aktifkan lagi tombol */

btn.disabled=false;

btn.style.opacity="1";

btn.innerHTML="SIMPAN";

}



function tampilPopup(pesan){

document
.getElementById(
"popupText"
)
.innerHTML=
pesan;


document
.getElementById(
"popup"
)
.style.display=
"flex";

}



function tutupPopup(){

document
.getElementById(
"popup"
)
.style.display=
"none";

}



async function selesaiRak(){

const tim=

document
.getElementById(
"tim"
)
.value;


const petugas=

document
.getElementById(
"petugas"
)
.value;


const rak=

document
.getElementById(
"rak"
)
.value;


if(

!tim ||

!petugas

){

tampilPopup(

"⚠️ Harap pilih tim dan petugas dulu"

);

return;

}


if(!rak){

tampilPopup(

"⚠️ Rak kosong"

);

return;

}


const body={

action:"selesaiRak",

tim:tim,

petugas:petugas,

rak:rak

};


document
.getElementById(
"rak"
)
.value="";


document
.getElementById(
"rak"
)
.focus();


try{

await fetch(

API,

{

method:"POST",

body:
JSON.stringify(
body
)

}

);

}
catch(err){

console.log(err);

}

}

function resetProduk(){

produk=null;

document
.getElementById(
"produk"
)
.innerHTML=

"Belum ada produk";

}

function bunyiSukses(){

audioSukses.currentTime=0;

audioSukses.play();

}


function bunyiError(){

audioError.currentTime=0;

audioError.play();

}

function formatRak(input){

input.value=

input.value

.toUpperCase()

.replace(
/[^A-Z0-9]/g,
""

);

}
