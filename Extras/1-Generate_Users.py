import subprocess

for i in range(1,100):
	command = "curl -X POST -d \"name=test" + str(i) + "&password=test" + str(i) + " \" http://localhost:8080/api/signup"
	print (command) 
	p = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
	for line in p.stdout.readlines():
	    print (line),
	retval = p.wait()