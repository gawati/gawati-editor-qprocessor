# Gawati Publish Workflow

- User submits a document to be published on the Portal (gawati-data).
- editor-fe updates the state of the document to 'under_processing'.
- editor-fe places the iri on a request queue (IRI_Q).
- editor-qprocessor reads the iri from IRI_Q, prepares the zip and posts the zip package to portal-qprocessor.
- portal-qprocessor verifies the checksum of the incoming zip, stores it and places the path to the zip on the ZIP_Q.
- portal-publisher reads the ZIP_Q, extracts the zip and syncs the document with the Portal (gawati-data).
- portal-publisher updates the STATUS_Q thereafter.
- portal-qprocessor reads from STATUS_Q and posts the status to editor-qprocessor.
- editor-qprocessor writes the status on it's STATUS_Q (i.e the status queue on the editor side).
- editor-fe reads the STATUS_Q and updates status of the document if it has been successfully published.

# Gawati Retract Workflow

- User submits a document to be retracted from the Portal (gawati-data).
- editor-fe updates the state of the document to 'under_retraction'.
- editor-fe places the iri on a request queue (IRI_Q) along with the action 'retract'.
- editor-qprocessor reads the iri from IRI_Q, and posts it to portal-qprocessor.
- portal-qprocessor places the iri on Portal's IRI_Q. Note that there are two different IRI_Qs, one on the Editor (accessed by editor-fe & editor-qprocessor) and one on the Portal (accessed by portal-qprocessor & portal-publisher).
- portal-publisher reads the IRI_Q, deletes the attachments associated with the IRI from its file system and purges the document from the Portal (gawati-data).
- portal-publisher updates the STATUS_Q thereafter.
- portal-qprocessor reads from STATUS_Q and posts the status to editor-qprocessor.
- editor-qprocessor writes the status on it's STATUS_Q (i.e the status queue on the editor side).
- editor-fe reads the STATUS_Q and updates status of the document if it has been successfully retracted.

### Notes:
- There are two Queue Exchanges
    - editor_doc_publish: 
        This is the exchange on the Editor side. It constists of two queues
        - IRI_Q
        - STATUS_Q
    - portal_doc_publish:
        This is the exchange on the Portal side. It constists of three queues
        - ZIP_Q
        - STATUS_Q
        - IRI_Q
- The two STATUS_Qs and IRI_Qs have no relation with each other.
- Roles
    - editor-fe: Publishes on IRI_Q, Consumes STATUS_Q
    - editor-qprocessor: Publishes on STATUS_Q, Consumes IRI_Q.
    - portal-qprocessor: Publishes on ZIP_Q & IRI_Q, Consumes STATUS_Q
    - portal-publisher: Publishes on STATUS_Q, Consumes ZIP_Q & IRI_Q.
- Status Object: {iri, status, message, action}.     
    *status* can be 'under_processing', 'under_retraction', 'failed', 'published'.  
    *action* can be 'publish' or 'retract'.  

    Note however, that the document state is updated to `under_processing` or `under_retraction` as soon as the user submits the publish/retract request. The document status is again updated only when the status is `published` or `retracted`. 
    The statuses `under_processing`, `under_retraction` and `failed` in Status Object are only meant for exchaging information about the progress of the publish workflow and do not trigger document state updates *(ASHOK: This last point merits further discussion)*.

### Setup
*Publishing Workflow* consists for several components which need to be started in the given order:
1. Start the Editor components
    - gawati-client-data (eXist-db)
    - gawati-editor-qprocessor
    - gawati-editor-fe
    - gawati-editor-ui
2. Start the Portal components
    - gawati-data (eXist-db)
    - gawati-portal-publisher
    - gawati-portal-qprocessor

### Dependencies
1. The workflow requires 
    - gawati-editor-fe and gawati-editor-processor to be on the same system.
    - gawati-portal-qprocessor and gawati-portal-publisher to be on the same system

### Publish Workflow Diagram
![Publish Workflow Diagram](https://user-images.githubusercontent.com/5685392/40117804-a7ac284c-5935-11e8-9c5f-df963048ac26.png "Publish Workflow Diagram")