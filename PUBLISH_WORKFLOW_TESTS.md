# Gawati Publish Workflow Tests
### Service down
When one of the chain of services is down. Assuming that the queues never go down.
Onward:
1. gawati-portal-publisher down
Zip entry for iri remains in the ZIP_Q. It is picked up by gawati-portal-publisher when it comes back up.
2. gawati-portal-qprocessor down
gawati-editor-qprocessor receives error when it tries to post the zip. It sets the status on editor side STATUS_Q to failed. This triggers the iri to be re-queued on IRI_Q.
3. gawati-editor-qprocessor down
iri entry remains in the IRI_Q. It is picked up gawati-editor-qprocessor when it comes back up.
4. gawati-editor-fe down
User receives error.

Return:
1. gawati-editor-fe down
Status entry for iri remains in the editor's STATUS_Q. It is picked up by gawati-editor-fe when it comes back up.
2. gawati-editor-qprocessor down
Post by gawati-portal-qprocessor fails. Status object needs to be re-queued on the portal's STATUS_Q. (TO-DO)
3. gawati-portal-qprocessor down
Status entry remains in the portal's STATUS_Q. It is picked up gawati-portal-qprocessor when it comes back up.
4. gawati-portal-publisher down
Publisher picks up the zip and then goes down before writing to STATUS_Q. The document may or may not be synced on portal. iri will remain stuck in 'under_processing'. Some kind of timeout mechanism - reset the doc state back and notify the user upon doc refresh/load? (TO-DO)

### Queue failure
If queues go down, the service that is a consumer of that queue will crash.
For example, if Editor IRI_Q goes down, gawati-editor-qprocessor goes down.
gawati-editor-fe publish to IRI_Q needs to be checked for failure. 
- Need to check publish on queue for failure (TO-DO)
- Handle consumer service when the queue goes down (TO-DO)