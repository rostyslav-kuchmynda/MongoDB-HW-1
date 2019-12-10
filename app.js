const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'magic-db';

// Use connect method to connect to the server
MongoClient.connect(url, { useUnifiedTopology: true }, async function (err, client) {
    const db = client.db(dbName);
    const users = db.collection('users');
    const articles = db.collection('articles');
    const students = db.collection('students');

    const consoleLog = arr => arr.forEach(el => console.log(el));

    const worstHomework = await students.aggregate([
        {
            $match: {
                scores: {
                    $elemMatch: {
                        score: {
                            $lte: 50
                        },
                        type: 'homework'
                    }
                }
            }
        },
        {
            $sort: {
                'scores.2.score': - 1
            }
        }

    ]).limit(5).toArray()
    // consoleLog(worstHomework);

    const bestQuizNworstHomework = await students.aggregate([
        {
            $match: {
                $and: [
                    {
                        scores: {
                            $elemMatch: {
                                score: {
                                    $gte: 50
                                },
                                type: 'quiz'
                            }
                        }
                    },
                    {
                        scores: {
                            $elemMatch: {
                                score: {
                                    $lte: 50
                                },
                                type: 'homework'
                            }
                        }
                    }
                ]
            }
        },
        {
            $sort:
            {
                'scores.1.score': 1,
                'scores.2.score': 1
            }
        },
        {
            $project: {
                '_id': 0,
                'name': 0,
            }
        }

    ]).limit(5).toArray()
    // consoleLog(bestQuizNworstHomework);

    const bestQuizAndExam = await students.aggregate([
        {
            $match: {
                $and: [
                    {
                        scores: {
                            $elemMatch: {
                                score: {
                                    $gt: 80
                                },
                                type: 'quiz'
                            }
                        }
                    },
                    {
                        scores: {
                            $elemMatch: {
                                score: {
                                    $gt: 80
                                },
                                type: 'exam'
                            }
                        }
                    }
                ]
            }
        }
    ]).limit(5).toArray()
    // consoleLog(bestQuizAndExam)

    const avrgHomework = await students.aggregate([
        {
            $unwind: '$scores'
        },
        {
            $match: { 'scores.type': 'homework' }
        },
        {
            $group: {
                _id: null,
                avgHW: { $avg: '$scores.score' }
            }
        }

        // {
        //     $group: {
        //         _id: null,
        //         avgResult: { $avg: 'scores.2.score' }
        //     }
        // }
    ]).limit(5).toArray()
    // consoleLog(avrgHomework)

    const homeworkLessThan60 = await students.deleteMany({
        'scores.2.score': { $lt: 60 }
    })
    // consoleLog(homeworkLessThan60)

    const QuizMoreThan80 = await students.updateMany(
        {
            'scores.1.score': { $gt: 80 }
        },
        {
            $set: {
                students: 'score more than 80'
            }
        }
    )
    // consoleLog(QuizMoreThan80)


    client.close();
});
