const form = document.querySelector('form')
const inputFile = form[0]
const inputEnc = form[1]
const textArea = form[3]

const progressUpload = document.querySelectorAll('progress')[0]
const progressDownload = document.querySelectorAll('progress')[1]

const infoUpload = document.querySelectorAll('span')[0]
const infoDownload = document.querySelectorAll('span')[1]

const infoError = document.querySelector('h3')

form[0].addEventListener('change', () => {
    progressUpload.value = 0
    progressDownload.value = 0
    infoError.innerText = ''
})

form.addEventListener('submit', e => {
    e.preventDefault()
    
    //console.dir(form)
    //creo un FormData vacío
    let data = new FormData()
    
    //Cargo la información del archivo en ese formdata en forma manual
    data.append('archivo', inputFile.files[0])
    data.append('texto', textArea.value)
    data.append('enc', inputEnc.checked)

    //Envío el FormData al servidor
    enviarFormDataAjax('/upload',data, url => {
        //console.log(url)
        //inputFile.value = ''
        let porcentaje = 0
        progressDownload.value = porcentaje
        infoDownload.innerText = porcentaje + '%'

        const xhr = new XMLHttpRequest()
        xhr.open('get', url)
        xhr.responseType = 'blob'
        xhr.addEventListener('load', () => {
            if(xhr.status == 200) {
                const imgBlob = xhr.response
                let imgUrl = URL.createObjectURL(imgBlob)

                const link = document.createElement('a');
                link.href = imgUrl;
                link.setAttribute('download', url.replace('/conv/',''));
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
        
                setTimeout(() => {
                    //location.href = '/clear?file=' + url
                    const xhr = new XMLHttpRequest()
                    xhr.open('get', '/clear?file=' + url)
                    xhr.addEventListener('load', () => {
                        if(xhr.status == 200) {
                            inputFile.value = ''
                            textArea.value = ''
                            
                            porcentaje = 0
                            progressUpload.value = porcentaje
                            infoUpload.innerText = porcentaje + '%'
                            progressDownload.value = porcentaje
                            infoDownload.innerText = porcentaje + '%'
                        }
                    })
                    xhr.send()
                },1500)
            }
        })
        xhr.addEventListener('error', e => {
            console.error('Error en la comunicación download ajax', e)
            repreError('Error en la comunicación download ajax', e)

        })
        xhr.addEventListener('progress', e => {
            if(e.lengthComputable) {
                porcentaje = parseInt((e.loaded * 100) / e.total)
                //console.warn(porcentaje + '%')
    
                progressDownload.value = porcentaje
                infoDownload.innerText = porcentaje + '%'
            }
        })
        xhr.send()
    })
})

/* ----------------------------------------------------------- */
/*    Envío de información al servidor contenida en FormData   */
/* ----------------------------------------------------------- */
function enviarFormDataAjax(url, data, cb) {
    let porcentaje = 0
    progressUpload.value = porcentaje
    infoUpload.innerText = porcentaje + '%'

    const xhr = new XMLHttpRequest()
    xhr.open('post',url)
    xhr.addEventListener('load', () => {
        if(xhr.status == 200) {
            //console.log(xhr.response)
            const { url, error, msg } = JSON.parse(xhr.response)
            if(error) {
                repreError('ERROR:', error)
            }
            else if(msg) {
                textArea.value = msg
                setTimeout(() => {
                    const xhr = new XMLHttpRequest()
                    xhr.open('get', '/clear?file=' + url)
                    xhr.addEventListener('load', () => {
                        if(xhr.status == 200) {
                            let porcentaje = 0
                            progressUpload.value = porcentaje
                            infoUpload.innerText = porcentaje + '%'
                            progressDownload.value = porcentaje
                            infoDownload.innerText = porcentaje + '%'
                        }
                    })
                    xhr.send()                    
                },1500)                
            }
            else cb(url)
        }
        else {
            console.error('Error el enviar los datos', xhr.status)
            repreError('Error el enviar los datos', xhr.status)
        }
    })
    xhr.addEventListener('error', e => {
        console.error('Error en la comunicación upload ajax', e)
        repreError('Error en la comunicación upload ajax', e)
    })
    xhr.upload.addEventListener('progress', e => {
        if(e.lengthComputable) {
            porcentaje = parseInt((e.loaded * 100) / e.total)
            //console.warn(porcentaje + '%')

            progressUpload.value = porcentaje
            infoUpload.innerText = porcentaje + '%'
            //progress.value = porcentaje
            //span.innerText = porcentaje + '%'
        }
    })
    xhr.send(data)
}


function repreError(title, body) {
    const text = `${title}: ${ typeof body == 'object'? JSON.stringify(body) : body }`
    infoError.innerText = text

    /* setTimeout(() => {
        infoError.innerText = ''
    },1000) */
}   