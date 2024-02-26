
import { createElement } from 'lwc';
import FileUploader from 'c/fileUploader';
import { createRecord } from 'lightning/uiRecordApi';

// Mock the createRecord function from the lightning/uiRecordApi module
jest.mock('lightning/uiRecordApi', () => ({
    createRecord: jest.fn()
}));

describe('FileUploader', () => {
    afterEach(() => {
        // Reset the mock implementation after each test
        jest.clearAllMocks();
    });

    it('handles file change event correctly', () => {
        const element = createElement('c-file-uploader', {
            is: FileUploader
        });
        document.body.appendChild(element);

        const fileInput = element.shadowRoot.querySelector('input[type="file"]');
        const file = new File(['file contents'], 'filename.txt');
        const mockFileReader = {
            result: 'data:base64,file contents',
            onloadend: jest.fn()
        };
        global.FileReader = jest.fn(() => mockFileReader);

        fileInput.dispatchEvent(new CustomEvent('change', {
            detail: { target: { files: [file] } }
        }));

        expect(element.file).toBe(file);
        expect(element.fileName).toBe(file.name);
        expect(element.fileReader).toBe(mockFileReader);
        expect(mockFileReader.onloadend).toHaveBeenCalled();
    });

    it('creates a record for file upload', () => {
        const element = createElement('c-file-uploader', {
            is: FileUploader
        });
        document.body.appendChild(element);

        const mockResult = { id: 'mockDocumentId' };
        createRecord.mockResolvedValue(mockResult);

        element.fileName = 'filename.txt';
        element.fileReader = {
            result: 'data:base64,file contents'
        };
        element.recordId = 'mockRecordId';

        return Promise.resolve().then(() => {
            const showToastEvent = new ShowToastEvent({
                title: 'Success',
                message: 'File uploaded successfully',
                variant: 'success'
            });
            expect(createRecord).toHaveBeenCalledWith({
                apiName: 'File_Upload__c',
                fields: {
                    Document_Name__c: 'filename.txt',
                    Created_By__c: 'mockRecordId',
                    Body: 'base64,file contents'
                }
            });
            expect(element.dispatchEvent).toHaveBeenCalledWith(showToastEvent);
            expect(element.updateServiceRequestDocumentURL).toHaveBeenCalledWith('mockDocumentId');
        });
    });

    it('displays an error message if file upload fails', () => {
        const element = createElement('c-file-uploader', {
            is: FileUploader
        });
        document.body.appendChild(element);

        const error = { body: { message: 'Upload failed' } };
        createRecord.mockRejectedValue(error);

        element.fileName = 'filename.txt';
        element.fileReader = {
            result: 'data:base64,file contents'
        };
        element.recordId = 'mockRecordId';

        return Promise.resolve().then(() => {
            const showToastEvent = new ShowToastEvent({
                title: 'Error',
                message: 'Error uploading file: Upload failed',
                variant: 'error'
            });
            expect(createRecord).toHaveBeenCalledWith({
                apiName: 'File_Upload__c',
                fields: {
                    Document_Name__c: 'filename.txt',
                    Created_By__c: 'mockRecordId',
                    Body: 'base64,file contents'
                }
            });
            expect(element.dispatchEvent).toHaveBeenCalledWith(showToastEvent);
        });
    });

    it('updates the service request document URL', () => {
        const element = createElement('c-file-uploader', {
            is: FileUploader
        });
        document.body.appendChild(element);

        const mockResult = { id: 'mockDocumentId' };
        createRecord.mockResolvedValue(mockResult);

        element.recordId = 'mockRecordId';
        element.updateServiceRequestDocumentURL('mockDocumentId');

        return Promise.resolve().then(() => {
            const showToastEvent = new ShowToastEvent({
                title: 'Success',
                message: 'Document URL updated successfully',
                variant: 'success'
            });
            expect(updateRecord).toHaveBeenCalledWith({
                fields: {
                    [DOCUMENT_URL_FIELD]: 'mockDocumentId'
                },
                Id: 'mockRecordId'
            });
            expect(element.dispatchEvent).toHaveBeenCalledWith(showToastEvent);
        });
    });

    it('displays an error message if updating document URL fails', () => {
        const element = createElement('c-file-uploader', {
            is: FileUploader
        });
        document.body.appendChild(element);

        const error = { body: { message: 'Update failed' } };
        updateRecord.mockRejectedValue(error);

        element.recordId = 'mockRecordId';
        element.updateServiceRequestDocumentURL('mockDocumentId');

        return Promise.resolve().then(() => {
            const showToastEvent = new ShowToastEvent({
                title: 'Error',
                message: 'Error updating document URL: Update failed',
                variant: 'error'
            });
            expect(updateRecord).toHaveBeenCalledWith({
                fields: {
                    [DOCUMENT_URL_FIELD]: 'mockDocumentId'
                },
                Id: 'mockRecordId'
            });
            expect(element.dispatchEvent).toHaveBeenCalledWith(showToastEvent);
        });
    });
});
