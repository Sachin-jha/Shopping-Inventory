import { LightningElement, wire, track } from 'lwc';
import { registerListener } from 'c/pubSubFile';
import { CurrentPageReference } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getDataByItemName from '@salesforce/apex/ShoppingInventory.getDataByItemName';
import saveData from '@salesforce/apex/ShoppingInventory.saveData';
import getTotalAmount from '@salesforce/apex/ShoppingInventory.getTotalAmount';
import sendInvoiceToMail from '@salesforce/apex/ShoppingInventory.sendInvoiceToMail';

export default class AddToCart extends LightningElement {

    btnDisable=true;
    emailID='';
    counter=0;
    @track cart=[]; 
    @track cartError=[]; 
    @track processedCart=[]; 
    error='';
    name='';
    @track itemCount=[]; @track itemTemp=[];
    item=''
    totalAmountInCart=0;
    totalAmtError='';

    @wire(CurrentPageReference) pageRef;
    connectedCallback(){
        registerListener("sendName", this.addToCart, this)
    }

    addToCart(itemName){
        this.name = itemName;
        console.log('name:- '+this.name+'/'+itemName)
        this.addToCartComponent();
    }
    @wire(getDataByItemName, {itemName: '$name'})
    addToCartComponent(result){
        if(result.data){
            this.cart = result.data;
            for(let i=0; i<this.cart.length; i++){
                this.processedCart.push(this.cart[i]);
            }              
            console.log('Processed Array:- '+JSON.stringify(this.processedCart))  
            console.log('Processed Array Length:- '+this.processedCart.length);     

        } else if(result.error){    
            console.log('error:- '+result.error);
            this.cartError.push(result.error)
        }        
    }

    handleRemoveItem(){
        for(let i=0; i<this.cart.length; i++){
            this.processedCart.pop(this.processedCart[i])
            this.calculateAmt();
        }
        console.log('Processed Array:- '+JSON.stringify(this.processedCart))
        console.log('Processed Array Length:- '+this.processedCart.length);   
    }

    handleCheckout(){
        console.log('Checkout :- '+JSON.stringify(this.processedCart))
        console.log('Counter:- '+this.counter);
        //Save the Cart Item into Transactional Object
        saveData({listOfSelectedItem: this.processedCart})
        this.fireToastForCheckOut();
        this.btnDisable=false;         
    }

    handleInvoice(){
        console.log('invoice to send on mail:- '+this.emailID)
        //Send email along with cart item details
        sendInvoiceToMail({cartItem : this.processedCart, customerEmail: this.emailID})
        this.fireToastForInvoice();
        //Used for delaying some time and Refresh the Page
        setTimeout(function(){
            window.location.reload();
        }, 4000);        
    }

    handleEmail(event){
        this.emailID = event.target.value;
        console.log('email:- '+this.emailID);
    }

    numberDecrese(event){
        this.counter = event.detail;
        console.log('decrease:- '+this.counter)
        this.calculateAmt();   
    }

    numberIncrese(event){
        this.counter = event.detail;
        console.log('increase:- '+this.counter)
        this.calculateAmt();   
    }

    calculateAmt(){
        //Get the total amount of Cart Item
        getTotalAmount({getValue: this.processedCart, quantity: this.counter})
        .then(result =>{
            this.totalAmountInCart = result;
            this.totalAmtError = undefined;            
        })
        .catch(error => {
            this.totalAmountInCart = undefined;
            this.totalAmtError = error;
        })  
    }

    fireToastForCheckOut(){
        const event = new ShowToastEvent({
            title:'Check-out',
            message:this.processedCart.length+' Items '+'Successfully Checked out, Enter your Email ID to send Invoice Receipt',
            variant:'Success'
        });
        this.dispatchEvent(event)     
    }

    fireToastForInvoice(){
        const event = new ShowToastEvent({
            title:'Invoice Generated',
            message:'Invoice are generated and it send to your mail ID "'+this.emailID+'" , Please check your mail',
            variant:'Success'
        });
        this.dispatchEvent(event)     
    }

    get disableButton(){
        if(this.processedCart.length==0){
            return this.processedCart.length <=0;
        }
    }

    /*addToCartComponent({data,error}){
        if(data){
            this.cart = data;
            let temp = [];
            this.cart.forEach(function(value){
                temp.push(value);
            })
            for(let i=0; i<temp.length; i++){
                this.processedCart.push(temp[i]);
            }  
            console.log('Processed Array:- '+JSON.stringify(this.processedCart))  
            console.log('Processed cart:- '+this.processedCart.length);        
        }else if(error){
            this.error = error;
        }
    }*/
    /*addToCartComponent(){
        Productdata()
        .then(result => {
            for(let k in result){
                if(result.hasOwnProperty(k)){
                    this.cart.push({value:result[k],k:k});
                }
            }
        })
    }*/

    /*addToCartComponent(result){
        if(result.data){
            this.cart.push(result.data);
            this.item = result.data;
            console.log('cart array:- '+JSON.stringify(this.cart));            
            console.log('cart size:- '+this.cart.length);
            console.log('item:- '+this.item);
        } else if(result.error){    
            console.log('error:- '+result.error);
            this.cartError.push(result.error)
        }        
    }*/

    
}