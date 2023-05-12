(async () => {
    let arr1 = [1, 2, 3, 4, 5]
    let promiseArray = await Promise.all(arr1.map((item) => {
        return Promise.resolve().then(
            setTimeout(() => {
                console.log(item)
            }, 1000)
        )
    }));
})()
