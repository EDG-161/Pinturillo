exports.validateNick = (params)=>{
    return new Promise((resolve, reject)=>{
        let name = String(params);
        if(name.length<1 || name.length>16){
            resolve("El nick no puede estar vacio o tener mas de 16 caracteres");
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
                resolve(true);
            }else{
                resolve("El nick debe contener solo letras y numeros");
            }
        }
    })
} 

exports.validateName = (params)=>{
    return new Promise((resolve, reject)=>{
        let name = String(params);
        if(name.length<1 || name.length>16){
            resolve("El nombre no puede estar vacio ni tener mas de 16 caracteres");
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
                resolve(true);
            }else{
                resolve("EL nombre solo puede tener letras y numeros");
            }
        }
    })
}

exports.validateNumbres = (params)=>{
    return new Promise((resolve, reject)=>{
        let number = String(params);
        if(number.length < 1 || number.length > 2){
            resolve("La cantidad de jugadores no puede estar vacia o pasar de 2 caracteres");
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
                        resolvet("La cantidad de jugadores debe estar entre 2 y 10 jugadores");
                    }else{
                        resolve(true);
                    }
                }catch(Exception){
                    resolve("La cantidad de jugadores solo puede contener numeros");
                }
            }else{
                resolve("La cantidad de jugadores solo puede contener numeros");
            }
        }
    })

}

exports.validateTopic = (params)=>{
    return new Promise((resolve, reject)=>{
        let name = String(params);
        if(name.length < 0){
            resolve("La Categoria no puede estar vacia");
        }else{
            let topics = ["Música","Cine","Alimentos","Lugares","Cosas","Videojuegos"];
            let flag = false;
            for(let i = 0; i < topics.length; i++){
                if(topics[i] == name){
                    flag = true;
                }
            }
            if(flag){
                resolve(true);
            }else{
                resolve("Selecciona una categoria valida");
            }
        }
    });
}

exports.remove = (params)=>{
    return new Promise((resolve, reject)=>{
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
        resolve(regreso);
    })
}

exports.validateMessage = (params)=>{
    return new Promise((resolve, reject)=>{
        let frase = xd(params)
        if(frase.length < 1 || frase.length > 30){
            resolve(false);
        }else{
            resolve(true);
        }
    })
}

function xd(params) {
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