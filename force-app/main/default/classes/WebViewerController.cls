public with sharing class WebViewerController {
//SELECT NamespacePrefix as Param FROM Organization
    @AuraEnabled(Cacheable=true)
    public static List<ContentVersion> searchContentVersion(String searchTerm) {
        searchTerm = searchTerm.trim();
        if (searchTerm == '') {
            return [SELECT Id, Title, FileExtension, IsMajorVersion, IsLatest, VersionData, IsAssetEnabled 
            FROM ContentVersion WHERE IsLatest = True ORDER BY Title LIMIT 50];
        }
        searchTerm = '%' + searchTerm + '%';
        return [SELECT Id, Title, FileExtension, IsMajorVersion, IsLatest, VersionData, IsAssetEnabled 
            FROM ContentVersion WHERE IsLatest = True AND (Title LIKE :searchTerm OR FileExtension LIKE :searchTerm) ORDER BY Title LIMIT 50];
    }

	@AuraEnabled(Cacheable=true)
    public static Map<String,Object> getFileList(String searchTerm) {
        List<ContentVersion> cvlist = searchContentVersion(searchTerm);
        List<ContentVersion> filteredFiles = new List<ContentVersion>();

        List<String> cvIds = new List<String>();

        for(ContentVersion item: cvlist) {
            if (!item.IsAssetEnabled) {
               filteredFiles.add(item);
               cvIds.add('' + item.Id);
            }
        }
        Map<String,Object> payload = new Map<String, Object>();
        payload.put('files', filteredFiles);
        if (searchTerm == '') {
            List<PDFTronThumbnail__c> contentVersion_attachments_throughTable = [SELECT Attachment_Id__c, Content_Version_Id__c FROM PDFTronThumbnail__c WHERE Content_Version_Id__c IN :cvIds];

            List<String> attIds = new List<String>();
            Set<Map<String,String>> contentVersion_attachments = new Set<Map<String,String>>();
            for(PDFTronThumbnail__c item: contentVersion_attachments_throughTable) {
                attIds.add(item.Attachment_Id__c);
                // Normilize throught table data
                Map<String,String> temp = new Map<String, String>();
                temp.put('Id', item.Id);
                temp.put('ContentVersion_Id', item.Content_Version_Id__c);
                temp.put('Attachment_Id', item.Attachment_Id__c);
                contentVersion_attachments.add(temp);
            }
            List<Attachment> attachments_table = [SELECT Id, ContentType,ParentId, Body, Name FROM Attachment WHERE Id IN :attIds];
            Set<Map<String,String>> attachments = new Set<Map<String,String>>();
            for (Attachment item : attachments_table) {
                Map<String,String> m1 = new Map<String, String>();
                m1.put('Id', '' + item.Id);
                m1.put('ContentType', item.ContentType);
                m1.put('Body', EncodingUtil.base64Encode(item.Body));
                m1.put('PDFTronTumbnail__c_Id', item.ParentId);
                attachments.add(m1);
            }
            payload.put('contentVersion_attachments', contentVersion_attachments);
            payload.put('attachments', attachments);
        }

        return payload;
    }

    @RemoteAction
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
    }   

    @AuraEnabled
    public static String saveAnnotations(String action, String documentId, String annotationId, String xfdfString) {
        PDFTronAnnotations__c[] annots = [SELECT Id, Content_Version_Id__c, Annotation_Id__c, xfdfString__c 
            FROM PDFTronAnnotations__c WHERE Annotation_Id__c = :annotationId];
        
        Pattern MyPattern = Pattern.compile('<delete>(.*)</delete>');
        Matcher MyMatcher = MyPattern.matcher(xfdfString);
        Boolean isDeleteCommand = MyMatcher.matches();

        if (action == 'delete') {
        // if (isDeleteCommand) {
            // Delete record
            delete annots;
            return 'Success';
        } else if (annots.size() == 0) {
            // Create new record
            PDFTronAnnotations__c newAnnot = new PDFTronAnnotations__c(
                Content_Version_Id__c=documentId,
                Annotation_Id__c=annotationId,
                xfdfString__c=xfdfString
            );
            insert newAnnot;
            return newAnnot.Id;
        } else {
            // Update record
            annots[0].xfdfString__c = xfdfString;
            update annots;
            return annots[0].Id;
        }
        
    }

    @AuraEnabled
    public static List<Map<String,String>> getAnnotations(String documentId) {
        List<PDFTronAnnotations__c> temp = [SELECT Id, Content_Version_Id__c, Annotation_Id__c, xfdfString__c FROM PDFTronAnnotations__c WHERE Content_Version_Id__c = :documentId];
        List<Map<String,String>> annotations = new List<Map<String,String>>();
        for (Integer i = 0; i < temp.size(); i++) {
            Map<String,String> annot = new Map<String, String>();
            annot.put('xfdfString', temp[i].xfdfString__c);
            annot.put('Annotation_Id', temp[i].Annotation_Id__c);
            annot.put('ContentVersion_Id', temp[i].Content_Version_Id__c);
            annotations.add(annot);
        }
        return annotations;
    }
}