import { LightningElement , wire} from 'lwc';
import { fireEvent } from 'c/pubSubFile';
import { CurrentPageReference } from 'lightning/navigation';

export default class VendorSearchItem extends LightningElement {
    
    @wire(CurrentPageReference) pageRef;
    handleCategory(event){
        var getCategory = event.target.value;
        fireEvent(this.pageRef, "CategoryEvent", getCategory);
    }

    @wire(CurrentPageReference) pageRef;
    handleSearch(event){
        var filterSearch = event.target.value;
        fireEvent(this.pageRef, "SearchEvent", filterSearch);
    }
}