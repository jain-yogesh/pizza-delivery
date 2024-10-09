import axios from 'axios'
import Swal from 'sweetalert2'

export function initStripe(){
    const stripe = await loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');
    const paymentType = document.querySelector('#paymentType');

    paymentType.addEventListener('change', () => {
        if(e.target.value === 'card')
        {

        }
        else
        {

        }
    })
//Ajax call to submit form data
const ordersForm = document.querySelector('#orders-form');
if(ordersForm)
{
    ordersForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let formData = new FormData(ordersForm);
        let formObject = {}

        for(let [key, value] of formData.entries()){
            formObject[key] = value
        }
        axios.post('/orders', formObject).then((res) => {
            Swal.fire({
                position: "top-end",
                icon: "sucess",
                title: res.data.message,
                showConfirmButton: false,
                timer: 1500
              });

              setTimeout(() => {
                  window.location.href = '/customer/orders'
              },1000);

        }).catch((err) => {
            Swal.fire({
                position: "top-end",
                icon: "error",
                title: err.res.data.message,
                showConfirmButton: false,
                timer: 1500
              });
        })
        
    })
}
}