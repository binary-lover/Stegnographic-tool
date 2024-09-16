# image segnography 

from tkinter import * # for GUI
import tkinter.filedialog # for file dialog
from tkinter import messagebox # for message box
from PIL import ImageTk # for image to be displayed in GUI
from PIL import Image   # for image processing (open, save, etc)
from io import BytesIO  # for io operations(reading, writing, etc)
import os # for file operations like renaming, etc

class IMG_Stegno:
    output_image_size = 0

    def main(self, root):
        root.title("Image Steganography by binarylvoer") # title of the window
        root.geometry("500x600") # size of the window
        root.resizable(width=False, height=False) # window size not resizable
        root.config(bg="#e3f4f1") # background color of the window
        frame = Frame(root) # frame for the window, frame means a container
        frame.grid()

        title = Label(frame, text="Image Steganography") # title of the window
        title.config(front=("Times new roman",25,"bold")) # font of the title
        title.grid(pady=10) # padding of the title
        title.config(bg="#e3f4f1") # background color of the title
        title.grid(row=1) # position of the title

        encode = Button(frame, text="Encode ->", command=lambda:self.encode_frame1(frame),padx=14, bg="#e3f4f1") # button for encoding
        encode.config(front=('Helvetica',14),bg="#e8c1c7") # font and background color of the button
        encode.grid(row=2) # position of the button
        decode = Button(frame, text="Decode ->", command=lambda:self.decode_frame1(frame),padx=14, bg="#e3f4f1") # button for encoding
        decode.config(front=('Helvetica',14),bg="#e8c1c7") # font and background color of the button
        decode.grid(pady=12)
        decode.grid(row=3)

        root.grid_rowconfigure(1, weight=1) # row configuration of the window means the row will be resized
        root.gric_columnconfigure(0, weight=1) # column configuration of the window means the column will be resized

    # Back function to loop back to the main screen
    def back(self, frame, root):
        frame.destroy() # destroy the frame
        self.main(root) # call the main function

    # Frame for encode page
    def encode_frame1(self, F):
        F.destroy()
        F2 = Frame(root) # frame for the window, frame means a container
        # Label is a widget used to display text or image
        label = Label(F2, text=" Select the image to be encoded: ", font=("Helvetica", 12), bg="#e3f4f1") # label for the frame
        label.config(front=("Times new roman", 25, "bold"), bg="#e3f4f1") # font and background color of the label
        label.grid()

        button_bws = Button(F2, text="Browse", command=lambda:self.encode_frame2(F2)) # button for browsing the image
        button_bws.config(front=("Helvetica", 18), bg="#e8c1c7") # font and background color of the button
        button_bws.grid() # position of the button

        button_back = Button(F2, text='Cancel', command=lambda:IMG_Stegno.back(F2)) # button for back
        button_back.config(front=("Helvetica", 18), bg="#e8c1c7")
        button_back.grid(pady=15)
        button_back.grid()
        F2.grid()


    # Frame for decode page
    def decode_frame1(self, F):
        F.destroy()
        d_f2 = Frame(root)
        label1 = Label(d_f2, text="Select the image to be decoded: ")
        label1.config(font=('Times now roman', 25, 'bold'), bg="#e3f4f1") # font and background color of the label
        label1.grid()
        label1.config(bg='#e3f4f1')
        
        button_bws = Button(d_f2, text="Browse", command=lambda:self.decode_frame2(d_f2)) # button for browsing the image
        button_bws.config(font=('Helvetica', 18), bg="#e8c1c7") # font and background color of the button
        button_bws.grid()
        button_back = Button(d_f2, text='Cancel', command=lambda:IMG_Stegno.back(self,d_f2))
        button_back.config(font=('Helvetica', 18), bg="#e8c1c7")
        button_back.grid(pady=15) 
        button_back.grid()  # position of the button
        d_f2.grid() # position of the frame


    # Function to endcode the image 
    def encode_frame2(self, e_F2):
        e_pg = Frame(root)
        myfile = tkinter.filedialog.askopenfilename( filetypes= ([('png','*.png'),('jpeg','*.jpeg'),('All files','*.*')]) ) 
        if not myfile:
            messagebox.showerror("Error", "No file selected")
        else:
            my_img = (Image.open(myfile))
            new_image = my_img.resize((300,200))
            img = ImageTk.PhotoImage(new_image)
            label3 = Label(e_pg, text='Select Image')   # label for the frame
            label3.config(font=('Helvetica', 25, 'bold')) # font of the label
            label3.grid() 
            board = Label(e_pg, image=img) # label for the image
            board.image = img # image for the label
            self.output_image_size = os.start(myfile) # size of the image
            self.o_image_w, self.o_image_h = my_img.size # width and height of the image
            board.grid()
            label2 = Label(e_pg , text="Enter the text to be encoded: ") # label for the text
            label2.config(font=('Helvetica', 25, 'bold'))
            label2.grid(pady=15)
            text_a.grid()
            encode_button = Button(e_pg, text="Encode", command=lambda:IMG_Stegno.back(self,e_pg))
            encode_button.config(font=('Helvetica', 14), bg="#e8c1c7")
            data = text_a.get('1.0',"end-1c")
            button_back = Button(e_pg, text='Encode', command=lambda:[self.enc_fun(text_a,my_img),IMG_Stegno.back(self,e_pg)])
            button_back.config(font=('Helvetica', 14), bg="#e8c1c7")
            button_back.grid(pady=15)
            button_back.grid()
            e_pg.grid(row=1)
            e_F2.destroy()
            
    