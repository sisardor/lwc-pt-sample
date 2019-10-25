public with sharing class WVFileBrowserController {
	@AuraEnabled(Cacheable=true)
    public static Map<String,Object> getFileList() {
        List<ContentVersion> cvlist = [SELECT Id, Title, FileExtension, IsMajorVersion, IsLatest, VersionData, IsAssetEnabled FROM ContentVersion];
        List<ContentVersion> filteredList = new List<ContentVersion>();
        // System.debug('### getFileList ###');
        List<String> cvIds = new List<String>();

        for(ContentVersion item: cvlist) {
            if (!item.IsAssetEnabled) {
               filteredList.add(item);
               cvIds.add('' + item.Id);
            }
        }
        List<PDFTronThumbnail__c> contentVersion_attachments = [SELECT Attachment_Id__c, Content_Version_Id__c FROM PDFTronThumbnail__c WHERE Content_Version_Id__c IN :cvIds];

        List<String> attIds = new List<String>();
        for(PDFTronThumbnail__c item: contentVersion_attachments) {
            attIds.add(item.Attachment_Id__c);
        }
        List<Attachment> attachments = [SELECT Id, ContentType,ParentId, Body, Name FROM Attachment WHERE Id IN :attIds];
        Set<Map<String,String>> s1 = new Set<Map<String,String>>();
        for (Attachment item : attachments) {
            Map<String,String> m1 = new Map<String, String>();
            m1.put('Id', '' + item.Id);
            m1.put('ContentType', item.ContentType);
            m1.put('Body', EncodingUtil.base64Encode(item.Body));
            m1.put('PDFTronTumbnail__c_Id', item.ParentId);
            s1.add(m1);
        }

        Map<String,Object> m = new Map<String, Object>();
        m.put('files', filteredList);
        m.put('contentVersion_attachments', contentVersion_attachments);
        m.put('attachments', s1);
        return m;
    }

    @AuraEnabled(Cacheable=true)
    public static ContentVersion getFileById(String Id) {
        return [SELECT Id, Title, FileExtension, IsMajorVersion, IsLatest, VersionData, IsAssetEnabled FROM ContentVersion WHERE Id = :Id];
    }

    @AuraEnabled(Cacheable=true)
    public static String getFileBlobById(String Id) {
        ContentVersion cv = [SELECT Id, Title, FileExtension, IsMajorVersion, IsLatest, VersionData, IsAssetEnabled FROM ContentVersion WHERE Id = :Id];
        // Returns string
        return EncodingUtil.base64Encode(cv.VersionData);
    }

    @AuraEnabled
    public static ID createAttachment(String Name, ID ContentVersionId, String ContentType, String Body ) {
        PDFTronThumbnail__c thum = new PDFTronThumbnail__c(Name=Name, Content_Version_Id__c=ContentVersionId );
        insert thum;
        Attachment attachment = new Attachment(Name=Name, IsPrivate=True, ParentId=thum.Id, ContentType=ContentType, Body=EncodingUtil.base64Decode(Body));
        insert attachment;
        thum.put('Attachment_Id__c', attachment.Id);
        upsert thum;
        return attachment.Id;
        // return '500B000000403APIAY';
    }   
    @AuraEnabled
    public static ID createThumbnail(String Name, String Body ) {
        PDFTronThumbnail__c thum = new PDFTronThumbnail__c(Name=Name);
        insert thum;
        return thum.Id;
    }   
}