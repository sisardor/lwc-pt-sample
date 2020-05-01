@isTest
private class WebViewerControllerTest {
    @isTest static void testGetFileList() {
        List<ContentVersion> res = WebViewerController.searchContentVersion('test');
        System.assertEquals(res.size(), 0);
        
       ContentVersion contentVersion_1 = new ContentVersion(
            Title = 'some test title',
            PathOnClient = 'some title'+'.txt',
            VersionData = Blob.valueOf('some content to access later on'),
            IsMajorVersion = false /*so that can be updated later on*/
            );
        insert contentVersion_1;
        System.assertNotEquals(contentVersion_1.Id, null);

        Map<String,Object> res2 = WebViewerController.getFileList('test');

        System.assertEquals(res2.size(), 1);

        Map<String,Object> res3 = WebViewerController.getFileList('');
        System.debug(res3);

        List<ContentVersion> res4 = WebViewerController.searchContentVersion('');
        System.debug(res4);
        
    }
    @isTest static void testGetFileBlobById() {
        ContentVersion contentVersion_1 = new ContentVersion(
            Title = 'some test title',
            PathOnClient = 'some title'+'.txt',
            VersionData = Blob.valueOf('some content to access later on'),
            IsMajorVersion = false /*so that can be updated later on*/
            );
        insert contentVersion_1;
        String blobstr = WebViewerController.getFileBlobById(contentVersion_1.Id);
        System.assertNotEquals(blobstr, null);

    }

    @isTest static void testCreateAttachment() {
        ContentVersion contentVersion_1 = new ContentVersion(
            Title = 'some test title',
            PathOnClient = 'some title'+'.txt',
            VersionData = Blob.valueOf('some content to access later on'),
            IsMajorVersion = false /*so that can be updated later on*/
            );
        insert contentVersion_1;
        String resId = WebViewerController.createAttachment('Name', contentVersion_1.Id, 'ContentType', 'some content to access later on');
        System.assertEquals(resId.length(), 18, 'PDFTronThumbnail__c & Attachment created successfully');

        String annot = WebViewerController.saveAnnotations('action', contentVersion_1.Id, 'annotationId', 'xfdfString');
        System.assertNotEquals(annot, null);

        String annot2 = WebViewerController.saveAnnotations('action', contentVersion_1.Id, 'annotationId', 'xfdfString_new');
        System.assertNotEquals(annot2, 'Fail');
        List<Map<String,String>> res = WebViewerController.getAnnotations(contentVersion_1.Id);
        System.assertEquals(res.size(), 1, 'One record of PDFTronAnnotations__c created successfully');

        String annot3 = WebViewerController.saveAnnotations('delete', contentVersion_1.Id, 'annotationId', 'xfdfString_newdsfd');
        System.assertEquals(annot3, 'Success');
    }

    @isTest static void testContentVersionWithThumb() {
        ContentVersion contentVersion_1 = new ContentVersion(
            Title = 'some test title',
            PathOnClient = 'some title'+'.txt',
            VersionData = Blob.valueOf('some content to access later on'),
            IsMajorVersion = false /*so that can be updated later on*/
            );
        insert contentVersion_1;
        System.assertNotEquals(contentVersion_1.Id, null);
        String resId = WebViewerController.createAttachment('Name', contentVersion_1.Id, 'ContentType', 'some content to access later on');
        Map<String,Object> res3 = WebViewerController.getFileList('');
    }
}