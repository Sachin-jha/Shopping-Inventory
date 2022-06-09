import { LightningElement, track } from 'lwc';

export default class Counter extends LightningElement {

    ctr=0;
    @track ctrArray=[];

    handleDecrement(event){
        this.ctr = this.ctr-1;
        this.dispatchEvent(new CustomEvent('decrement',{
            detail:this.ctr
        }))
    }

    handleIncrement(event){
        this.ctr = this.ctr+1;
        this.dispatchEvent(new CustomEvent('increment',{
            detail:this.ctr
        }))
    }

    get disableOnZero(){
        return this.ctr <= 0;
    }


}