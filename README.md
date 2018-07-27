Following technlogies are used for implementing the Article API:  

1) AWS API Gateway
2) AWS Lambda(Node.js runtime)
3) Elastic Search 

AWS Gateway and Lambda are used as they provide a runtime environment for running business code without the need of setting up any underlying server infrastructure. Elastic Search is used as data store as it has good support for running search queries.  

All APIs have been written as separate functions so that they can be deployed and scaled independently. 
