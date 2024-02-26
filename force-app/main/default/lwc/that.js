
import { LightningElement, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { createRecord } from 'lightning/uiRecordApi';
import { getRecord } from 'lightning/uiRecordApi';

export default class FileUploader extends LightningElement {
    @api recordId; // Service Request record Id

    file;
    fileName;
    fileReader;

    handleFileChange(event) {
        this.file = event.target.files[0];
        this.fileName = this.file.name;
        this.fileReader = new FileReader();
        this.fileReader.onloadend = this.handleFileReaderLoadEnd.bind(this);
        this.fileReader.readAsDataURL(this.file);
    }

    handleFileReaderLoadEnd() {
        let fileContents = this.fileReader.result.split(',')[1];
        let documentName = this.fileName;
        let createdBy = this.recordId; // Assuming the CreatedBy field is the record Id of the Service Request

        // Create a record for the file upload
        createRecord({
            apiName: 'File_Upload__c', // Replace with the API name of the custom object
            fields: {
                Document_Name__c: documentName,
                Created_By__c: createdBy,
                Body: fileContents
            }
        })
        .then(result => {
            // Get the file URL from the response and display a success message
            let documentURL = result.id;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'File uploaded successfully',
                    variant: 'success'
                })
            );

            // Save the file URL to the Service Request record
            this.updateServiceRequestDocumentURL(documentURL);
        })
        .catch(error => {
            // Display an error message if the file upload fails
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Error uploading file: ' + error.body.message,
                    variant: 'error'
                })
            );
        });
    }

    updateServiceRequestDocumentURL(documentURL) {
        // Update the Service Request record with the AWS file link
        const fields = {};
        fields[DOCUMENT_URL_FIELD] = documentURL; // Replace with the API name of the Document URL field

        const recordInput = { fields };
        recordInput.Id = this.recordId;

        updateRecord(recordInput)
            .then(() => {
                // Display a success message
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Document URL updated successfully',
                        variant: 'success'
                    })
                );
            })
            .catch(error => {
                // Display an error message if the update fails
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Error updating document URL: ' + error.body.message,
                        variant: 'error'
                    })
                );
            });
    }
}
