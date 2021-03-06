# Editor Q Processor Component for 

## Gawati Publishing
- Reads doc iri to be published from IRI_Q
- Gets the XML and attachments for the iri
- Creates a zip package
- Posts the zip to Portal Q Processor
- Writes status on STATUS_Q

## Gawati Retraction
- Reads doc iri to be retracted from IRI_Q
- Posts the iri to Portal Q Processor
- Writes status on STATUS_Q

### Setup
1. Clone the repo
    ```
    git clone https://github.com/gawati/gawati-editor-qprocessor.git
    ```
2. Install packages
    ```
    npm install
    ```
3. Run
    ```
    node ./bin/www
    ```

### Dependencies
1. This component needs to on the same system as gawati-editor-fe.
2. It depends on several other components which are a part of the *Publishing/Retraction Workflow*. The following components need to be started, in the given order, prior to gawati-editor-qprocessor:
    - gawati-data
    - gawati-portal-publisher
    - gawati-portal-qprocessor

### Config
1. Port: The default port is set to 9003.
2. Document attachments path: This is set in `constants.js` and refers to the filesystem path where attachments are stored for all Editor documents.
3. Service end points: Endpoints for talking to gawati-editor-fe and gawati-portal-qprocessor. Set in `configs/dataServer.json`

##### Workflow

 * [Workflow Documentation](PUBLISH_RETRACT_WORKFLOW.md)
 * [Workflow Tests](PUBLISH_WORKFLOW_TESTS.md)
