import matplotlib.pyplot as plt
import datetime
import math
import numpy as np
import numpy.linalg as npl
import xml.etree.ElementTree as ET
tree = ET.parse('2014-08-07-70.kml')
root = tree.getroot()
ts = []
coord = []
speed = []
speedAbsolut = []
speedNorm = []
listofThree = []
offSetL = 8.9
offSetB = 47.7
earthR = 3671000.
countAll = 0
newBirdIndexList = [0]
allBirds = []


class Bird(object):
    def __init__(self, iD, time, speed, speedAbsolut, speedNorm):
        self.iD = iD
        self.time = time
        self.speed = speed
        self.speedAbsolut = speedAbsolut
        self.speedNorm = speedNorm


for n in root.iter('{http://www.opengis.net/kml/2.2}when'):
    ts.append(datetime.datetime.strptime(n.text, "%Y-%m-%dT%H:%M:%SZ"))
    if countAll > 0:
        if (ts[countAll] - ts[countAll - 1]) < datetime.timedelta(0):
            newBirdIndexList.append(countAll)
    countAll = countAll + 1

newBirdIndexList.append(countAll)

print("First part of first Job is Done")

countAll = 0
i = 0

for n in root.iter('{http://www.google.com/kml/ext/2.2}coord'):
    listofThree = map(float, n.text.split(","))  # Read the Values in Degrees
    listofThree[0] = ((listofThree[0] - offSetL)/360.) * 2. * \
        math.pi * earthR * math.cos((47./360.) * math.pi)

    listofThree[1] = ((listofThree[1] - offSetB)/360.) * 2.*math.pi * earthR
    coord.append(np.array(listofThree))
    if countAll == newBirdIndexList[i]:
        speed.append(None)
        speedAbsolut.append(None)
        speedNorm.append(None)
        i = i + 1
    else:
        speedCur = coord[countAll] - coord[countAll - 1]
        speed.append(speedCur)
        speedAbsolut.append(npl.norm(speedCur))
        speedNorm.append(speedCur / npl.norm(speedCur))
    countAll = countAll + 1

print("First Job is Done :)")

nL = newBirdIndexList

for i in xrange(0, len(newBirdIndexList) - 1):
    allBirds.append(Bird(i + 1, ts[nL[i]:nL[i+1]], speed[nL[i]:nL[i+1]],
                         speedAbsolut[nL[i]:nL[i+1]],
                         speedNorm[nL[i]:nL[i+1]]))

print("Second Job is Done")

time1 = datetime.datetime.now()

followerListsAllTimes = []
bestTau = 0  # was soll das?

tIntHalf = 6

for tOffs in range(10, 250, 10):
    for birdI in allBirds:
        for birdJ in allBirds:
            if birdI != birdJ:
                sumTauList = []
                for tau in range(-3, 4):
                    sumB = 0
                    for t in range(tOffs - tIntHalf, tOffs + 1 + tIntHalf):
                        vDotProd = np.dot(birdI.speedNorm[t],
                                          birdJ.speedNorm[t + tau])
                        sumB = sumB + vDotProd
                    sumTauList.append(sumB)
                bestTau = (sumTauList.index(max(sumTauList)) - 3,
                           max(sumTauList) / (tIntHalf * 2. + 1.))
                if bestTau[1] > 0.98:
                    birdParam = (tOffs, birdI.iD, birdJ.iD, bestTau)
                    followerListsAllTimes.append(birdParam)


time2 = datetime.datetime.now()

print("Time used for Anlysis:")
deltaTime = time2 - time1
print(deltaTime)
print(followerListsAllTimes)

plt.plot(allBirds[0].speedAbsolut[5:250])
plt.ylabel("Speed of the first bird")
plt.show()