import axios from 'axios'
import Swal from 'sweetalert2'
import {initAdmin} from './admin'
import moment from 'moment'
import { initStripe } from './stripe'

let addToCart = document.querySelectorAll('.add-to-cart')
let cartCounter = document.querySelector('#cartCounter')

const updateCart = (pizza) => {
    axios.post('/update-cart', pizza).then(res => {
        console.log(res)
        cartCounter.innerText = res.data.TotalQty
        Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Item added to cart",
            showConfirmButton: false,
            timer: 1500
          });
    }).catch(err => {
        Swal.fire({
            position: "top-end",
            icon: "error",
            title: "Something went wrong",
            showConfirmButton: false,
            timer: 1500
          });
    })
}

addToCart.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        let pizza = JSON.parse(btn.dataset.pizza)
        updateCart(pizza)
    })
})

//Remove alert message after X seconds
const alertMsg = document.querySelector('#sucess-alert')
if(alertMsg){
    setTimeout(() => {
        alertMsg.remove()
    }, 3000)
}

// Change Order status

let statuses = document.querySelectorAll('.status-line')
let hiddenInput = document.querySelector('#hiddenInput')
let order =  hiddenInput ? hiddenInput.value : null
order = JSON.parse(order)

let time = document.createElement('small')

function updateStatus(order)
{
    //clear all css classes
    statuses.forEach((stat) => {
        stat.classList.remove('step-completed')
        stat.classList.remove('step-current')
    })

    //add css classes
    let stepCpmleted = true;

    statuses.forEach((stat) => {
        let dataProp = stat.dataset.status

        if(stepCpmleted){
            stat.classList.add('step-completed')
        }

        if(dataProp === order.status)
        {
            stepCpmleted = false;
            
            time.innerText = moment(order.updatedAt,).format('DD/MM/YYYY (hh:mm A)')
            stat.appendChild(time)

            if(stat.nextElementSibling)
                {
                stat.nextElementSibling.classList.add('step-current')
            }
        }
    })

}


updateStatus(order);

initStripe();


//Socket
let socket = io()

//Join
if(order)
{
    socket.emit('join', `order_${order._id}`)
}

let adminAreaPath = window.location.pathname
if(adminAreaPath.includes('admin'))
{
    initAdmin(socket)
    socket.emit('join','adminRoom')
}

socket.on('orderUpdated', (data) => 
{
    const upadtedOrder = { ...order }
    upadtedOrder.updatedAt = moment().format()
    upadtedOrder.status = data.status

    updateStatus(upadtedOrder)

    Swal.fire({
        position: "top-end",
        icon: "success",
        title: `Order updated to ${upadtedOrder.status}`,
        showConfirmButton: false,
        timer: 1500
      });
})