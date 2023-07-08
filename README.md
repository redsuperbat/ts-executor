# ts-executor
A program that takes arbirary typescript code, compiles it, executes it and sends the stdout result back to the client.

The executor is designed to run in a docker container for a bit of added security. 
With that said, this solution is not secure by design so I do not recommend you to run it anywhere unstrusted code can be executed. I use it to execute arbitraty typescript code during presentations.

