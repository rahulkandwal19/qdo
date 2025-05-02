from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator
#--------------------------------------------------------------------------------
app = Flask(__name__)
CORS(app)
#--------------------------------------------------------------------------------
def remove_bottom_zero_row(matrix):
    if matrix and all(cell == '0' for cell in matrix[-1]):
        matrix.pop()
    return matrix

@app.route("/executeCircuit", methods=["POST"])
def generate_res():
    data = request.json
    matrix = data.get('array', [])
    matrix = remove_bottom_zero_row(matrix)
    print("Received matrix:", matrix)

    qc = QuantumCircuit(14, len(matrix))

    for i in range(1,len(matrix)):
        for j in range(1,len(matrix[0])):
            if(matrix[i][j] == 'X'):
                qc.x(i-1)
            elif (matrix[i][j] == 'Y'):
                qc.y(i)
            elif (matrix[i][j] == 'Z'):
                qc.z(i)
            elif (matrix[i][j] == 'H'):
                qc.h(i)
            elif (matrix[i][j] == 'S'):
                qc.s(i)
            elif (matrix[i][j] == 'T'):
                qc.t(i)
            elif (matrix[i][j] == 'ROT-X'):
                theta = np.pi / 4
                qc.rx(theta, i)
            elif (matrix[i][j] == 'ROT-Y'):
                theta = np.pi / 4
                qc.ry(theta, i)
            elif (matrix[i][j] == 'ROT-Z'):
                theta = np.pi / 4
                qc.rz(theta, i)
            elif (matrix[i][j] == 'I'):
                qc.i(i)

    qc.measure(list(range(len(matrix))) ,list(range(len(matrix))) )
    simulator = AerSimulator()
    compiled_circuit = transpile(qc, simulator)
    sim_result = simulator.run(compiled_circuit).result()
    counts = sim_result.get_counts()

    print("Full Results:", counts)
    qbitStates = {}
    for i in range(0,len(matrix)):
        qbitStates[i] = [bitstring[i] for bitstring in counts.keys()]

    result = {'finalYeld':counts,'qbits':qbitStates}  
    return jsonify(result)
#--------------------------------------------------------------------------------
if __name__ == '__main__':
    app.run(port=80,threaded=True)