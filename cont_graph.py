import matplotlib.pyplot as plt
import matplotlib.animation as animation
import random
import time
import sqlite3

fig, ax = plt.subplots()
x_data, y_data = [], []
line, = ax.plot(x_data, y_data)

start_time = time.time()

def update(frame):
    current_time = time.time() - start_time
    new_data = random.randint(0, 10) 

    x_data.append(current_time)
    y_data.append(new_data)
    line.set_data(x_data, y_data)
    ax.relim()
    ax.autoscale_view() 

    return line,
ani = animation.FuncAnimation(fig, update, frames=range(100), interval=1000, blit=True)
plt.xlabel('Time (s)')
plt.ylabel('Value')
plt.title('Continuous Data Stream')
plt.show()

