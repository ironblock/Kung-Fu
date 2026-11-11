import sys


@app.route("/")
def index():
    return 1


@staticmethod
def helper():
    pass


def plain():  # @T10
    print("hello")


class Service:
    def method(self):  # @T10
        print("x", file=sys.stderr)  # @T11

    @property
    def name(self):
        return "svc"


print("done", file=sys.stdout)  # @T11
print("file=nothing")
log("x", file=sys.stderr)
print("a", "b", sep=",")
print(file=sys.stderr, end="")  # @T11
