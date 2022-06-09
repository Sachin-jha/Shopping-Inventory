import { LightningElement, wire } from 'lwc';
import { fireEvent } from 'c/pubSubFile';
import { registerListener } from 'c/pubSubFile';
import { CurrentPageReference } from 'lightning/navigation';
import getListOFItem from '@salesforce/apex/ShoppingInventory.getListOFItem';
import getListOFItemByName from '@salesforce/apex/ShoppingInventory.getListOFItemByName';
import getListOFItemByItemCategory from '@salesforce/apex/ShoppingInventory.getListOFItemByItemCategory';


export default class ShowItem extends LightningElement {

    counter=0;

    totalItem=''; searchByName=''; categoryName='';
    totalItemError='';
    visibleItem='';
    searchError=''; catError='';

    @wire(getListOFItem)
    wiredItems({error, data}){
        if(data){ 
            this.totalItem = data
            console.log('Whole Data'+this.totalItem)
        }
        if(error){
            this.totalItemError = error;
            console.error('Whole Data Erorr:- '+error)
        }
    }

    updateItemHandler(event){
        this.visibleItem = event.detail.records
        console.log('product:- '+this.visibleItem);
        console.log(event.detail.records)
    }

    //Getting All Event From searchItem Component
    @wire(CurrentPageReference) pageRef;
    connectedCallback(){
        registerListener("CategoryEvent", this.fiterByCategory, this);
        registerListener("SearchEvent", this.filterSearchDetail, this);                
    }

    //Handle Category Filteration
    fiterByCategory(catName){
       this.categoryName = catName;
       this.fiterByCategoryData();
    }
    @wire(getListOFItemByItemCategory, {catName: '$categoryName'})
    fiterByCategoryData(result){
        if (result.data) {
            this.totalItem = result.data;
            this.catError = undefined;    
            console.log('filtered category search data:- '+result.data);
        } else if (result.error) {
            this.catError = result.error;
            console.log('error: '+this.catError);
            this.totalItem = undefined;
        }
    }

    //Handle Search Filteration
    filterSearchDetail(fname){
        this.searchByName = fname;
        this.filterSearchData();
    }
    @wire(getListOFItemByName, {fname: '$searchByName'})
    filterSearchData(result){
        if (result.data) {
            this.totalItem = result.data;
            this.searchError = undefined;    
            console.log('filtered search data:- '+result.data);
        } else if (result.error) {
            this.searchError = result.error;
            console.log('error: '+this.searchError);
            this.totalItem = undefined;
        }
    }

  

    
    numberDecrese(event){
        this.counter = event.detail;
        console.log('decrease:- '+this.counter)
    }

    numberIncrese(event){
        this.counter = event.detail;
        console.log('increase:- '+this.counter)
    }

    @wire(CurrentPageReference) pageRef
    handleAddToCart(event){
        var itemName = event.target.value;
        fireEvent(this.pageRef,"sendName",itemName)
        //fireEvent(this.pageRef,"sendCounter",this.counter)
        console.log('add to cart '+this.counter+' / '+itemName)
    }


}