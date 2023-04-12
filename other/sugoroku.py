"""
＜実行方法＞
python sugoroku.py [N]
Nはスタートからゴールまでの距離であり，スタートとゴールも含め全てでMコマあれば，N=M-1となる

＜コンソールの表示について＞
Probabilityの欄は，「[n回でちょうどゴールできる確率] / [n回以下でゴールできる確率]」 を表示
Expected Valueの欄は，ゴールに到達するまでにサイコロを振る回数の期待値を表示

＜理論＞
サイコロをn回振ったときにスタートから距離xのコマに到達する確率をp_n(x)とする
p_n = 1/6 * [p_n(1), p_n(2), ..., p_n(N)]^T とおいたとき，n≧2において p_n = A @ p_(n-1) が成立
これにより，p_n = A^(n-1) @ p_1 となる
さらに，A^nのi行j列（インデックスは1スタート）をα_n(i,j)とおくと，p_n(N) = 1/6 * sum(j=1 to 6)(α_(n-1)(N,j)) となる
p_n(N)は，サイコロをn回"以下"振ったときにゴールする確率のため，ちょうどn回振ったときにゴールする確率q_nは，q_n = p_n(N) - p_(n-1)(N) で求まる
"""

import sys
import numpy as np

def makeA(N): #上記の行列Aを作成
    A = np.zeros((N, N))
    for i in range(1, N-1):
        for j in range(max(0,i-6), i):
            A[i][j] = 1/6;
    for j in range(N-7, N-1):
        A[N-1][j] = (j-N+8) / 6;
    A[N-1][N-1] = 1;
    return A

def findProbability(N, A): #確率を求める
    goal_prob_berow = [] #サイコロをi+1回以下振ったときにゴールする確率
    goal_prob_berow.append(max((7-N)/6, 0)) #P[0]
    power_A = A #A^n
    for n in range(1, N):
        goal_prob_berow.append((1/6) * sum([power_A[N-1][j] for j in range(6)]))
        power_A = A @ power_A

    goal_prob = [goal_prob_berow[0]] #サイコロをちょうどi+1回振ったときにゴールする確率
    for n in range(1, N):
        goal_prob.append(goal_prob_berow[n] - goal_prob_berow[n-1])
        
    expected = sum([goal_prob[n] * (n+1) for n in range(N)]) #ゴールまでの回数の期待値
    
    return goal_prob, goal_prob_berow, expected

def showResult(N, A, prob):
    print("<Probability>")
    for n in range(N):
        print("\tn={0}: {1} / {2}".format(n+1, prob[0][n], prob[1][n]))
    print("\n<Expected Value>")
    print("\t{}".format(prob[2]))

if __name__ == "__main__":
    N = int(sys.argv[1]) #スタートからゴールまでの距離
    A = makeA(N)
    prob = findProbability(N, A)
    showResult(N, A, prob)