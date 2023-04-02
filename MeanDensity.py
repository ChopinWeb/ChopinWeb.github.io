import os
import tkinter as tk
from tkinter import ttk
from tkinter import filedialog as tiFileDialog
import time

def StrExist(_str1_, _str2_): #_str1_に_str2_が存在するかどうかのBoolean
    if type(_str2_) is str:
        return _str1_.find(_str2_) != -1
    else:
        for s in _str2_:
            if _str1_.find(s) != -1:
                return True
        return False

def LenExcept(_str_): #コンマとスペースを除いて文字数をカウント
    if StrExist(_str_, ","):
        return len(_str_) - _str_.count(" ") - 1
    else:
        return len(_str_)

def LeftNonNote(_str_): #左端に連続するノーツでない数を数える
    list = []
    for i in range(1,5):
        if StrExist(_str_, str(i)):
            ExistIndex = _str_.find(str(i))
            SplitStr = _str_[:ExistIndex+1]
            list.append(ExistIndex - SplitStr.count(" "))
    if list != []:
        return min(list)
    else:
        return -1

def RightNonNote(_str_): #右端に連続するノーツでない数を数える
    _str_ = "".join(list(reversed(_str_)))
    if StrExist(_str_, ","):
        _str_ = _str_.split(",")[-1]
    return LeftNonNote(_str_)


class TkinterClass:
    def __init__(self):
        self.upfolder = __file__
        self.start_up = True
        
        root = tk.Tk()
        root.iconbitmap("data/icon.ico")
        root.title("平均密度計算機")
        root.geometry("500x350")
        
        #ファイル選択
        music_form = tk.Label(text="曲名", font=("", 12))
        music_form.place(relx=0, rely=0.05)
        
        self.music = tk.StringVar()
        self.file = ""
        music_label = tk.Label(root, textvariable=self.music, background="#ffffff", anchor="w", width=30, borderwidth=1, relief="groove", font=("", 12))
        music_label.place(relx=0.2, rely=0.05)
        
        file_select_button = tk.Button(root, text="ファイル選択", font=("", 8), width=12, height=2, bg="#d9d9d9")
        file_select_button.bind("<ButtonPress>", self.file_dialog)
        file_select_button.place(relx=0.8, rely=0.05)
        
        #難易度選択
        course_form = tk.Label(root, text="難易度", font=("", 12))
        course_form.place(relx=0, rely=0.15)
        
        self.course = tk.StringVar()
        self.course.set("ONI")
        courseList = ["EDIT", "ONI", "HARD", "NORMAL", "EASY"]
        course_cb = ttk.Combobox(root, textvariable=self.course, values=courseList, background="#ffffff", width=10, font=("", 12))
        course_cb.place(relx=0.2, rely=0.15)
        
        #小節選択
        measure_form = tk.Label(root, text="計算する小節", font=("", 12))
        measure_form.place(relx=0, rely=0.25)
        
        measure_label = tk.Label(root, text="　　　　　 から　　　　　　まで", font=("", 12))
        measure_label.place(relx=0.2, rely=0.25)
        
        self.firstms = tk.StringVar()
        self.firstms.set("最初")
        firstms_txt = tk.Entry(root, textvariable=self.firstms, background="#ffffff", width=6, font=("", 12))
        firstms_txt.place(relx=0.2, rely=0.25)
        
        self.lastms = tk.StringVar()
        self.lastms.set("最後")
        lastms_txt = tk.Entry(root, textvariable=self.lastms, background="#ffffff", width=6, font=("", 12))
        lastms_txt.place(relx=0.4, rely=0.25)
        
        #計算する
        calc_button = tk.Button(root, text="計算する", font=("", 16), fg="#ff0000", width=18, height=1, bg="#d9d9d9")
        calc_button.place(relx=0.28, rely=0.35)
        calc_button.bind("<ButtonPress>", self.CalcElm)
        
        #結果
        self.result = tk.StringVar()
        result_label = tk.Label(root, textvariable=self.result, background="#ffffff", anchor="nw", justify="left", width=53, height=8, borderwidth=1, relief="groove", font=("", 12))
        result_label.place(relx=0.02, rely=0.5)
        
        root.mainloop()


    def file_dialog(self, event):
        fTyp = [("", "tja")]
        iDir = os.path.abspath(os.path.dirname(self.upfolder if os.path.exists(self.upfolder) else __file__))            
        file_tmp = tk.filedialog.askopenfilename(filetypes=fTyp, initialdir=iDir)
        if len(file_tmp) != 0:
            file_separate = file_tmp.split("/")
            self.file = file_tmp
            self.music.set(file_separate.pop(-1)[0:-4])
            self.upfolder = "/".join(file_separate)


    def CalcElm(self, event):
        start = time.time()
        self.result.set("")
        resultStr = ""
        if self.file == "":
            resultStr += "ファイルを選択してください。\n"
        elif not os.path.exists(self.file):
            resultStr += "指定のファイルが存在しません。\n"
        if self.firstms.get() != "最初" and not self.firstms.get().isdecimal():
            resultStr += "開始小節には、整数か\"最初\"を入力してください。\n"
        if self.lastms.get() != "最後" and not self.lastms.get().isdecimal():
            resultStr += "終了小節には、整数か\"最後\"を入力してください。\n"
        if resultStr != "":
            self.result.set(resultStr)
            return
        
        with open(self.file,"r") as fl:
            f = fl.readlines()
        
        courseDic = {"EDIT":"4", "ONI":"3", "HARD":"2", "NORMAL":"1", "EASY":"0"}
        select_course = [self.course.get(), courseDic[self.course.get()]]
        first = 1 if self.firstms.get() == "最初" else int(self.firstms.get())
        last = float('inf') if self.lastms.get() == "最後" else int(self.lastms.get())
                    
        #StartSwch
            #初期値0
            #指定の難易度に入ったら1
            #"#START"が出てきたら2
            #ノーツが始まると3
            #2小節目以降は4
            #ノーツが存在する最後の行であると5or6(2小節以上あるときは5、そうでないときは6)
        StartSwch = 0
        beatnum = 4 #一小節当たりの拍数
            
       #RowElm:行ごとの情報
           #第0列：全数字数
            #第1列：うちノーツ数
            #第2列：BPM
        RowElm = []
        #MeasureElm:小節ごとの情報
            #第0列：ノーツ数
            #第1列：秒数
        MeasureElm = []
        
        _LeftNonNote = 0 #_LeftNonNote:1小節目の左に連続するノーツ意外の数字の数
        _RightNonNote = 0 #_RightNonNote:その小節の右に連続するノーツ意外の数字の数
        
        #前処理
        for r in range(len(f)):
            f[r] = f[r].split("\n")[0] #改行
            if StrExist(f[r], "//"): #コメントアウト
                f[r] = f[r].split("//")[0]
        
        for r in range(len(f)):
            #print(r)
            
            #指定の難易度の"#START"が現れるまでスキップ
            if StartSwch <= 1:
                if StrExist(f[r], "BPM:"): #最初のBPM宣言
                    bpm = float(f[r].split(":")[1])
                elif StrExist(f[r], "COURSE:") and (StrExist(f[r].upper(), select_course)): #難易度宣言
                    StartSwch = 1
                elif StrExist(f[r], "#START") and StartSwch == 1: #その難易度下での"#START"
                    StartSwch = 2
                continue
            
            #BPMの切り替わり
            elif StrExist(f[r], "#BPMCHANGE"):
                bpm = float(f[r].split(" ")[1])
            
            #拍子の切り替わり
            elif StrExist(f[r], "#MEASURE"):
                MeasureStr = f[r].split(" ")[1].split("/")
                beatnum = 4 * int(MeasureStr[0])/int(MeasureStr[1])
            
            #ノーツ入力
            elif not StrExist(f[r], "#"):
                if StartSwch == 2 and first-1 <= len(MeasureElm): #"#START"以降なら
                    StartNonNote = LeftNonNote(f[r]) #左に連続するノーツ以外の数字の数
                    if StartNonNote != -1: #ノーツの始まり
                        if RowElm == []: #1小節目の1行目からノーツがあるとき
                            _LeftNonNote = StartNonNote
                        else: #1小節目の1行目にノーツがないとき
                            _LeftNonNote = sum([r[0] for r in RowElm]) + StartNonNote
                        StartRow = len(RowElm) #その小節の第何列からノーツが始まるか
                        StartSwch = 3
                RowElm.append([LenExcept(f[r]), f[r].count("1")+f[r].count("2")+f[r].count("3")+f[r].count("4"), bpm])
            #print("RowElm before initializing =",RowElm)
            
            #終わりかどうかを判定(StartSwxh>=5のときは重複捜査なので除外)
            if StartSwch <= 4:
                    
                #指定の最終小節に達したら、コンマのある行の下を"#END"にする
                if last == len(MeasureElm) + 1:
                    for l in range(r, len(f)):
                        if StrExist(f[l], ","):
                            f[l+1] = "#END"
                            break
                    
                for l in range(r+1, len(f)):
                    if StrExist(f[l], "#END"): #"#END"が存在
                        EndNonNote = RightNonNote(f[r]) #右に連続するノーツ以外の数字の数
                        EndRow = len(RowElm)-1 #その小節の第何列でノーツが終わるか
                        StartSwch = 5 if StartSwch == 4 else 6
                        break
                    elif StrExist(f[l], ["1","2","3","4"]) and (not StrExist(f[l], "#")): #ノーツがあればスキップ
                        break
             
            #小節終わり
            if StrExist(f[r], ",") and StartSwch >= 2:
                
                note = sum(r[1] for r in RowElm) if StartSwch >= 3 else 0 #小節中のノーツ数
                AllNum = sum(r[0] for r in RowElm) #小節中の全数字数                    
                t = 0 #小節の秒数 
                
                #ノーツの始まる小節
                if StartSwch in [3, 6]:
                    #最初のノーツから始まる拍子に設定
                    tmp_bn = beatnum
                    beatnum *= (1 - _LeftNonNote / AllNum)
                    
                #ノーツが終わる小節
                if StartSwch >= 5:
                    _RightNonNote = EndNonNote
                    if EndRow != len(RowElm)-1: #最後の行以外で終わっていれば
                        for l in range(EndRow+1, len(RowElm)):
                            _RightNonNote += RowElm[l][0]
                    #最後のノーツで終わる拍子に設定
                    beatnum *= (1 - (_RightNonNote+1) / (AllNum - _LeftNonNote))
     
                #ノーツが存在する小節
                if StartSwch >= 3:
                    if AllNum != 0:
                        for i in range(0, len(RowElm)):
                            t += beatnum * (RowElm[i][0]/AllNum) * (60/RowElm[i][2])
                    else:
                        t += beatnum * (60/bpm)
                
                if StartSwch == 3:
                    beatnum = tmp_bn
                    _LeftNonNote = 0
                    StartSwch = 4
                
                MeasureElm.append([note,t])
                if StartSwch >= 5: #処理を終了
                    #print("MeasureElm={}".format(MeasureElm))
                    #print("row=No.{0}\tbpm={1}\tbeatnum={2}\tStartSwch={3}\tLeftNonNote={4}\tcontent={5}\n".format(r, bpm, beatnum,StartSwch, LeftNonNote(f[r]), f[r]))
                    break
                RowElm = []
            
            #if len(MeasureElm) < 5:
                #print("RowElm after initializing  =",RowElm)
                #print("MeasureElm={}".format(MeasureElm))
                #print("row=No.{0}\tbpm={1}\tbeatnum={2}\tStartSwch={3}\tLeftNonNote={4}\tcontent={5}\n".format(r, bpm, beatnum,StartSwch, LeftNonNote(f[r]), f[r]))
        
        if StartSwch == 0:
            self.result.set("指定の難易度が存在しません。\n")
            return
        combo = sum(r[0] for r in MeasureElm) #コンボ数
        sec = sum(r[1] for r in MeasureElm) #曲の秒数
        if combo < 2:
            resultStr += "コンボ数は2コンボ以上にしてください。"
        else:
            resultStr += "コンボ数\t：{}コンボ\n".format(int(combo))
            resultStr += "秒数\t：{}秒\n".format(sec)
            resultStr += "平均密度：{}打/秒\n".format((combo-1) / sec)
        self.result.set(resultStr)
        
        t = time.time() - start
        print(t)
        
        
if __name__ == '__main__':
    TkinterClass()