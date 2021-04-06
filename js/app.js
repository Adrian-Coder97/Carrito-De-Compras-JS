const cards = document.getElementById("cards")
const items = document.getElementById("items")
const footer = document.getElementById("footer")
const templateCard = document.getElementById("template-card").content//content accede a los elementos del template
const templateFooter = document.getElementById("template-footer").content
const templateCarrito = document.getElementById("template-carrito").content
const fragment = document.createDocumentFragment()
let Carrito = {}//Carrito es un objeto vacio 

document.addEventListener("DOMContentLoaded", () => {//evento que se dispara cuando el doc html ha sido completamente cargado 
    fetchData()
    //PARA EL LOCAL STORAGE 
    if (localStorage.getItem("carrito")) {//si existe el local storage con la key carrito hacer algo(carrito es la llave)
        Carrito = JSON.parse(localStorage.getItem("carrito"))//llenar el carrito con la info del LOCAL STORAGE 
        pintarCarrito()
    }
})

cards.addEventListener("click", e => {//evento para que cuando se de clic en cualquier elemento del DOM haga algo nuestro codigo
    addCarrito(e)
})

items.addEventListener("click", e => {//para aumentar o restar elementos con los botones de + y - de la tabla 
    btnAccion(e)
})

const addCarrito = e => {//evento para que cuando se de clic en cualquier elemento del DOM haga algo nuestro codigo
    //console.log(e.target)
    //console.log(e.target.classList.contains("btn-dark"))// para seleccionar los botones (cuando se da clic en un boton nos regresa true y cuando se da clic en otra cosa nos da false)
    if (e.target.classList.contains("btn-dark")) {//si se da clic en un boton hacer algo
        //console.log(e.target.parentElement) //seleccionar el elementos padre del boton (seleccionar el div del card)
        setCarrito(e.target.parentElement)//enviar el elemento padre a setCarrito
    }
    e.stopPropagation()//este es necesario
}

const fetchData = async () => {
    try {
        const res = await fetch("./js/api.json")
        const data = await res.json()//recibir la data del json (el json es un metodo)
        //console.log(data)
        pintarCards(data)
    } catch (error) {
        console.log(error)
    }
}


const pintarCards = data => {
    //console.log(data)
    //RECORRER DATA: 
    data.forEach(producto => {
        //console.log(producto)
        templateCard.querySelector("h5").textContent = producto.title//poner el titulo del porducto en el h5 de la card
        templateCard.querySelector("p").textContent = producto.precio//poner el precio del porducto en el p de la card
        templateCard.querySelector("img").setAttribute("src", producto.thumbnailUrl)//poner la imagen  del porducto en el img de la card
        templateCard.querySelector("button").dataset.id = producto.id//crear el campo data-id para cada boton de las cards
        const clone = templateCard.cloneNode(true)//clonar las cards
        fragment.appendChild(clone)
    })
    cards.appendChild(fragment)//agregar las cards al la seccion cards 
}


const setCarrito = objeto => {
    //console.log(objeto)//mostrar el objeto recibido del addCarrito (es este caso recibe el <div class="card-body"> ya que este es el elemento padre del boton)
    const producto = {
        id: objeto.querySelector(".btn-dark").dataset.id,//obtener el id del boton del producto a lque se de clic
        title: objeto.querySelector("h5").textContent,//obtener el title del boton del producto al que se de clic
        precio: objeto.querySelector("p").textContent,//obtener el p del boton del producto al que se de clic
        cantidad: 1//cantidad del mismo porducto a comprar
    }

    if (Carrito.hasOwnProperty(producto.id)) {//si esta condicion se cumple quiere decir que el producto se esta duplicando entonces en vez de agregar otro a la lista solo aumentamos la cantidad
        producto.cantidad = Carrito[producto.id].cantidad + 1//sumar cantidad + 1
    }
    Carrito[producto.id] = { ...producto }//esta linea agrega el producto que se desea comprar al carrito 
    //console.log(Carrito)
    pintarCarrito()
}

//Poner El carrito en el DOM 
var pintarCarrito = () => {
    //console.log(Carrito)
    items.innerHTML = ""//limpiar el items antes de crear un nuevo elemento en la tablaa 
    Object.values(Carrito).forEach(producto => {
        templateCarrito.querySelector("th").textContent = producto.id
        templateCarrito.querySelectorAll("td")[0].textContent = producto.title
        templateCarrito.querySelectorAll("td")[1].textContent = producto.cantidad//cantidad va en el primer td que exista por es el [0]
        templateCarrito.querySelector(".btn-info").dataset.id = producto.id
        templateCarrito.querySelector(".btn-danger").dataset.id = producto.id
        templateCarrito.querySelector("span").textContent = producto.cantidad * producto.precio//mult cantidad por precio

        const clone = templateCarrito.cloneNode(true)//crear la tabla 
        fragment.appendChild(clone)
    })

    items.appendChild(fragment)

    pintarFooter()


    //GUARDAR LA INFORMACION EL EL LOCAL STORAGE 
    localStorage.setItem("carrito", JSON.stringify(Carrito))//recibe la llave y lo que queremos guardar

}

const pintarFooter = () => {
    footer.innerHTML = ""//limpiar el footer antes de crear un nuevo elemento
    if (Object.keys(Carrito).length === 0) {//si el carrito esta vacio mandar mensaje de empezar a comprar 
        footer.innerHTML = '<th scope="row" colspan="5">Carrito vacío - comience a comprar!</th>'
        return//SALIR DE LA FUNCION
    }

    const nCantidad = Object.values(Carrito).reduce((acc, { cantidad }) => acc + cantidad, 0)//PARA LA SUMA TOTAL DE LA CANTIDAD DE PRODUCTOS 
    const nPrecio = Object.values(Carrito).reduce((acc, { cantidad, precio }) => acc + cantidad * precio, 0)//PARA LA SUMA TOTAL DEL PRECIO 
    //console.log(nCantidad)
    //console.log(nPrecio)

    //crear el elemento en la tabla 
    templateFooter.querySelectorAll("td")[0].textContent = nCantidad
    templateFooter.querySelector("span").textContent = nPrecio

    const clone = templateFooter.cloneNode(true)
    fragment.appendChild(clone)
    footer.appendChild(fragment)

    const btnVaciar = document.getElementById("vaciar-carrito")//PARA VACIAR TODO EL CARRITO 
    btnVaciar.addEventListener("click", () => {
        Carrito = {}
        pintarCarrito()//VOLVER A PINTAR EL CARRITO 
    })
}

const btnAccion = (e) => {
    //console.log(e.target)//el e target es para que cuando demos clic en un elemtno de la tabla nos muestre a que le estamso dando click
    if (e.target.classList.contains("btn-info")) {//accion de aumentar con el boton de mas en el carrito 
        //console.log(Carrito[e.target.dataset.id])
        const producto = Carrito[e.target.dataset.id]
        producto.cantidad++
        Carrito[e.target.dataset.id] = { ...producto }
        pintarCarrito()//VOLVER A PINTAR EL CARRITO 
    }
    if (e.target.classList.contains("btn-danger")) {//accion de disminuir con el boton de mas en el carrito 
        const producto = Carrito[e.target.dataset.id]
        producto.cantidad--
        if (producto.cantidad === 0) {//eliminar si llega a 0
            delete Carrito[e.target.dataset.id]
        }
        pintarCarrito()//VOLVER A PINTAR EL CARRITO 
    }

    e.stopPropagation()
}