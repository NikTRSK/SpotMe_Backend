##

#### Testing login
`http://<server_ip>:<port>/api/authenticate?email=<user_email>&password=<user_password>`

* Returns a token. The `token` needs to be passed in to be used with the user, passed in as an `Authorization` string.

#### Testing local signup
`http://<server_ip>:<port>/api/signup?email=<user_email>&password=<user_password>`