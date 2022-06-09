public with sharing class ShoppingInventory {
    
    //Getting List of Item
    @AuraEnabled(cacheable=true)
    public static list<Product_Item__c> getListOFItem(){
        return[SELECT Name, Image__c, Selling_Price__c FROM Product_Item__c WHERE Item_Expired__C = false];
    }

    //Filtering Data by Item Name
    @AuraEnabled(cacheable=true)
    public static list<Product_Item__c> getListOFItemByName(String fname){
        String filterName = fname+'%';
        return[SELECT Name, Image__c, Selling_Price__c FROM Product_Item__c WHERE Name LIKE: filterName AND Item_Expired__C = false];
    }

    //Filtering Data by Item Category
    @AuraEnabled(cacheable=true)
    public static list<Product_Item__c> getListOFItemByItemCategory(String catName){
        return[SELECT Name, Image__c, Selling_Price__c FROM Product_Item__c WHERE category__c =: catName AND Item_Expired__C = false];
    }

    //Filtering Data by Item Brand
    @AuraEnabled(cacheable=true)
    public static list<Product_Item__c> getListOFItemByItemBrand(String brandName){
        return[SELECT Name, Image__c, Selling_Price__c FROM Product_Item__c WHERE brand__c =: brandName AND Item_Expired__C = false];
    }

    //Fetching Item Details
    @AuraEnabled(cacheable=true)
    public static list<Product_Item__c> getDataByItemName(String itemName){
        return[SELECT Name, Manufactured_Date__c, Expire_Date__c, Selling_Price__c 
                FROM Product_Item__c WHERE Name =: itemName];
    }

    //Saving Record from cart item into Transactional Object
    @AuraEnabled
    public static void saveData(list<Product_Item__c> listOfSelectedItem){
        System.debug('Selected Item:- '+listOfSelectedItem);
        list<Transactional_Data__c> lstOfTrans = new list<Transactional_Data__c>();        
        for(Product_Item__c item : listOfSelectedItem){
            Transactional_Data__c tran = new Transactional_Data__c(Item_Name__c=item.Name,Manufactured_Date__c=item.Manufactured_Date__c,Expire_Date__c=item.Expire_Date__c,MRP__c=item.Selling_Price__c);
            lstOfTrans.add(tran);
            System.debug('Name:- '+item.Name);
            System.debug('MRP:- '+item.Selling_Price__c);         
        }
        if(!lstOfTrans.isEmpty()){
            insert lstOfTrans;
        }
    }

    //Calculating Total Amount in Cart item
    @AuraEnabled(cacheable=true)
    public static Decimal getTotalAmount(list<Product_Item__c> getValue, Integer quantity){
        System.debug('Selected Item:- '+getValue);
        Decimal sum=0.0;
        for(Product_Item__c item : getValue){
            sum = (sum+(item.Selling_Price__c)*quantity);
            System.debug('Sum:- '+sum);
        }
        return sum;
    }

    //Send mail along with cart details
    @AuraEnabled
    public static void sendInvoiceToMail(list<Product_Item__c> cartItem, String customerEmail){
        System.debug('mail start');
        System.debug('Cart:- '+cartItem);
        list<String> lst = new list<String>();
        for(Product_Item__c i : cartItem){
            lst.add(String.valueOf(i.Name));
        }
        System.debug('lst:- '+lst);
        list<Messaging.SingleEmailMessage> listOfMail = new list<Messaging.SingleEmailMessage>();

        for(Product_Item__c item : cartItem){
            Messaging.SingleEmailMessage mailForCustomer = new Messaging.SingleEmailMessage();
            List<String> toAddress = new List<String>();
            toAddress.add(customerEmail);
            mailForCustomer.setToAddresses(toAddress);
            mailForCustomer.setSenderDisplayName('SHOPPING DESK INVENTORY SYSTEM');
            mailForCustomer.setSubject('Invoice Receipt');

            String htmlBody = '<table><tr><th>Item Name</th><th>Manufacture Date</th><th>Expired Date</th><th>MRP</th></tr>';
            htmlBody += '<tr> <td>'+item.Name+'</td>';
            htmlBody +=       '<td>'+item.Manufactured_Date__c+'</td>';
            htmlBody +=       '<td>'+item.Expire_Date__c+'</td>';
            htmlBody +=       '<td>'+'$'+item.Selling_Price__c+'</td> </tr>';
            htmlBody += '</table>';

            mailForCustomer.setHtmlBody(htmlBody);
            /*mailForCustomer.setHtmlBody('Item Name:- '+item.Name+'<br/>'+
                                        'Manufacture Date:- '+item.Manufactured_Date__c+'<br/>'+
                                        'Expired Date:- '+item.Expire_Date__c+'<br/>'+
                                        'MRP:- '+item.Selling_Price__c);*/
            listOfMail.add(mailForCustomer);
            System.debug('Name:- '+item.Name);
            System.debug('MRP:- '+item.Selling_Price__c);                 
        }
        Messaging.sendEmail(listOfMail);
        System.debug('mail end');
    }
}
