import sys
import re # Regular Expressions
import codecs # UniCode support
import random
from random import randint # Random number generator
# from pymongo import Connection # For DB Connection
from pymongo import MongoClient
from pymongo import ReturnDocument
from pymongo.errors import ConnectionFailure # For catching exeptions
import pprint

# Data members
genders = ["male", "female"]
schools = ["USC", "UCLA", "Bostn U"]
#genderPreferences = ["male", "female", "both"]
workoutTimes = ["ASAP", "Tomorrow", "This Week"]

def generateHeight():
  return ( str(random.randint(4,6)) + "." + str(random.randint(0,11)) )

#############################################################################

def updateUsers():
  # MongoDB connection
  try:
    db_conn = MongoClient("localhost:27017")
    # db_conn = Connection(host="localhost", port=27017) # speicify database parameters
    print ("Connected to MongoDB successfully!")
  except ConnectionFailure as e:
    sys.stderr.write("Could not connect to MongoDB: %s" % e)

  # Load the database. If doesn't exist Mongo creates it
  db_target = db_conn["SpotMeDB"]

  coll = db_target['users']

  # for post in coll.find({'name' : 'test1'}):
  #   pprint.pprint(post)

  for user_id in range(6,100):
    user = {
      "firstName": "Test",
      "lastName": (" user " + str(user_id)),
      "height": generateHeight(),
      "weight": str(random.randint(150, 210)),
      "gender": genders[random.randint(0,1)],
      "age": str(random.randint(18,30)),
      "school": schools[random.randint(0,1)],
      "workoutTime": workoutTimes[random.randint(0,2)],
      "genderPreference": genders[random.randint(0,1)]
    }

    print (user)

    result = coll.find_one_and_update(
      { "name":("test" + str(user_id)) },
      {"$set":user},
      # upsert=True
      return_document=ReturnDocument.AFTER
    )

    print("update succesfull")
    print(result)

if __name__ == '__main__':
  updateUsers()