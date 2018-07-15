import l_f_csv as lf

l_f_param = {
    'tauRange': 3,
    'timeResolution': 1,
    'minSigni': 0.85,
    'tStepIntervall': 8,
    'maxDist': 100
}

print (l_f_param['tStepIntervall'])

list = lf.get_list(l_f_param)

for i in range(0, 5):
    print(list[i])
