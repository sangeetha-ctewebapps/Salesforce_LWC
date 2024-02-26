import { LightningElement,track } from 'lwc';
import uploadFileToAzure from '@salesforce/apex/AzureFileUploadController.uploadFileToAzure';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import {NavigationMixin} from 'lightning/navigation';
export default class FileUploadToAzureStorageContainer extends NavigationMixin(LightningElement) {
@track filename='';
@track extensions;
fileData;
handleFileChange(event) {
 const file = event.target.files[0];
 var tempfile = file.name;
 this.extensions =  tempfile.substring(tempfile.lastIndexOf('.') + 1);
 //this.filename = tempfile.substring(0, tempfile.lastIndexOf('.'));       
 this.filename = tempfile; 
        var reader = new FileReader()
        reader.onload = () => {
            var base64 = reader.result.split(',')[1]
            this.fileData = {
                'filename': this.filename,
                'base64': base64,
                'extensions':this.extensions
            }
        }
        reader.readAsDataURL(file);
        
    }

    handleUpload() {
        const {base64, filename, extensions} = this.fileData
                uploadFileToAzure({base64, filename, extensions})
                    .then(result => {
                        var resp= JSON.parse(result); 
                        if(resp.statuscode==200 || resp.statuscode==201){
                            this.filename = '';
                            const evt1 = new ShowToastEvent({
                            title: 'Success!',
                            message: 'File uploaded successfully:',
                            variant: 'success'
                            });
                            this.dispatchEvent(evt1); 
                            if(resp.aufid !=null){
                             this[NavigationMixin.Navigate]({
                                 type: "standard__recordPage",
                                    attributes: {
                                        objectApiName: "Azure_Uploaded_File__c",
                                        actionName: "view",
                                        recordId: resp.aufid
                                     }
                                });
                            }else if(resp.inserterror!=null){
                            const evt2 = new ShowToastEvent({
                            title: 'Record Error!',
                            message: 'Record Creation is filed'+resp.inserterror,
                            variant: 'error'
                            });
                            this.dispatchEvent(evt2);
                            }
                          
                        }else{
                            const evt3 = new ShowToastEvent({
                            title: 'Callout Error! '+resp.statuscode,
                            message: 'File uploaded unsuccessfull: '+resp.responsebody,
                            variant: 'error'
                            });
                            this.dispatchEvent(evt3);
                        }
                    })
                    .catch(error => {
                        // Handle error
                        console.error('Error uploading file:', error);
                    });
           
        
    }
}