function validateNick(params, doom) {
    let name = String(params);
    if(name.length<1 || name.length>16){
        $(doom).html(getAlert("El nickname no puede estar vacio ni tener mas de 16 caracteres"));
        return false;
    }else{
        let OK = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZÁÉÍÓÚ0123456789";
        let int = 0;
        for(let i = 0; i < name.length; i++){
            for(let j = 0; j < OK.length; j++){
                if(name.toUpperCase().charAt(i) == OK.toUpperCase().charAt(j)){
                    int ++;
                }
            }
        }
        if(int == name.length){
            return true;
        }else{
            $(doom).html(getAlert("EL nickname solo puede tener letras y numeros"));
            return false;
        }
    }
}

function validateName(params, doom) {
    let name = String(params);
    if(name.length<1 || name.length>16){
        $(doom).html(getAlert("El nombre no puede estar vacio ni tener mas de 16 caracteres"));
        return false;
    }else{
        let OK = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZÁÉÍÓÚ0123456789";
        let int = 0;
        for(let i = 0; i < name.length; i++){
            for(let j = 0; j < OK.length; j++){
                if(name.toUpperCase().charAt(i) == OK.toUpperCase().charAt(j)){
                    int ++;
                }
            }
        }
        if(int == name.length){
            return true;
        }else{
            $(doom).html(getAlert("EL nombre solo puede tener letras y numeros"));
            return false;
        }
    }
}

function validateNumbres(params, doom) {
    let number = String(params);
    if(number.length < 1 || number.length > 2){
        $(doom).html(getAlert("La cantidad de jugadores no puede estar vacia o pasar de 2 caracteres"));
        return false;
    }else{
        let OK = "0123456789";
        let int = 0;
        for(let i=0; i<number.length; i++){
            for(let j=0; j<OK.length; j++){
                if(number.charAt(i) == OK.charAt(j)){
                    int++;
                }
            }
        }
        if(int == number.length){
            try{
                let intNumber = parseInt(number);
                if(intNumber<2 || number>10){
                    $(doom).html(getAlert("La cantidad de jugadores debe estar entre 2 y 10 jugadores"));
                    return false;
                }else{
                    return true;
                }
            }catch(Exception){
                $(doom).html(getAlert("La cantidad de jugadores solo puede contener numeros"));
                return false;                
            }
        }else{
            $(doom).html(getAlert("La cantidad de jugadores solo puede contener numeros"));
            return false;
        }
    }
}

function validateTopic(params, doom) {
    let name = String(params);
    if(name.length < 0){
        $(doom).html(getAlert("La Categoria no puede estar vacia"));
        return false;
    }else{
        let topics = ["Música","Cine","Alimentos","Lugares","Cosas","Videojuegos"];
        let flag = false;
        for(let i = 0; i < topics.length; i++){
            if(topics[i] == name){
                flag = true;
            }
        }
        if(flag){
            return true;
        }else{
            $(doom).html(getAlert("Selecciona una categoria valida"));
            return false;
        }
    }
}

function remove(params){
    let frase = String(params).trim().split("");
    let regreso = "";
    let not = `<>'"`
    for(let i=0; i<frase.length; i++){
        for(let j=0; j<not.length; j++){
            if(frase[i] == not.charAt(j)){
                frase[i] = "";
            }
        }
    }   
    for(let k=0; k<frase.length; k++){
        regreso += frase[k];
    }
    return regreso;
}

function validateMessage(params){
    let frase = remove(params)
    if(frase.length < 1 || frase.length > 30){
        return false;
    }else{
        return true;
    }
}

function getAlert(params) {
    let alert = `
    <div class="row">
        <div class="col-md-12">
            <div class="alert alert-dismissable alert-info" role="alert">
                <button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>
                <h6>${params}</h6>
            </div>
        </div>
    </div>`;
    return alert;
}